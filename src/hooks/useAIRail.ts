// AI Rail 状态机 hook — 管理 idle/generating/diffing/applied/error 状态
import { useState, useCallback, useRef, useEffect } from 'react';
import {
  type AiAction,
  type AiVendor,
  type AiStatus,
  type AiResult,
  type ParsedHunk,
  runAI,
  cancelAI,
  hasApiKey,
  parseDiff,
  applyDiffHunks,
  buildAIPreview,
} from '../lib/ai';
import { sanitizeText } from '../lib/redaction';

export interface UseAIRailOptions {
  content: string;
  vendor: AiVendor;
  desensitize: boolean;
  onApply: (newContent: string) => void;
  onToast: (message: string, kind?: 'info' | 'error' | 'success') => void;
}

export interface UseAIRailReturn {
  status: AiStatus;
  stream: string;
  result: AiResult | null;
  error: string | null;
  hunks: ParsedHunk[];
  lastAction: AiAction | null;
  pendingAction: AiAction | null;
  pendingPreview: string;
  run: (action: AiAction) => Promise<void>;
  confirmSend: (rawContentConfirmed?: boolean) => Promise<void>;
  cancel: () => void;
  applySelected: (selectedIds: Set<number>) => void;
  reject: () => void;
  reset: () => void;
}

export function useAIRail(opts: UseAIRailOptions): UseAIRailReturn {
  const { content, vendor, desensitize, onApply, onToast } = opts;
  const [status, setStatus] = useState<AiStatus>('idle');
  const [stream, setStream] = useState('');
  const [result, setResult] = useState<AiResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hunks, setHunks] = useState<ParsedHunk[]>([]);
  const [lastAction, setLastAction] = useState<AiAction | null>(null);
  const [pendingAction, setPendingAction] = useState<AiAction | null>(null);
  const [pendingPreview, setPendingPreview] = useState('');
  const contentRef = useRef(content);

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  const reset = useCallback(() => {
    setStatus('idle');
    setStream('');
    setResult(null);
    setError(null);
    setHunks([]);
    setLastAction(null);
    setPendingAction(null);
    setPendingPreview('');
  }, []);

  const run = useCallback(
    async (action: AiAction) => {
      if (status === 'generating') return;

      setStatus('generating');
      setStream('');
      setResult(null);
      setError(null);
      setHunks([]);
      setLastAction(action);

      const hasKey = await hasApiKey(vendor);
      if (!hasKey) {
        setStatus('idle');
        onToast(`未配置 ${vendor} 的 API Key，请先在设置中添加`, 'error');
        return;
      }

      setPendingAction(action);
      setPendingPreview(buildAIPreview(contentRef.current, desensitize));
      setStatus('confirming');
    },
    [status, vendor, desensitize, onToast],
  );

  const confirmSend = useCallback(
    async (rawContentConfirmed = false) => {
      if (!pendingAction) return;
      const action = pendingAction;
      const preview = buildAIPreview(contentRef.current, desensitize);
      setStatus('generating');
      setStream('');
      setError(null);
      setPendingPreview(preview);

      await runAI({
        content: contentRef.current,
        action,
        vendor,
        desensitize,
        sendConfirmed: true,
        rawContentConfirmed,
        preview,
        onChunk: (chunk) => {
          setStream((prev) => prev + chunk);
        },
        onDone: (res) => {
          setResult(res);

          if (action === 'safe') {
            // safe 动作只读不回写，直接回到 idle
            setStatus('idle');
            onToast('安全审查完成，请查看生成内容', 'success');
            return;
          }

          if (!res.content.trim()) {
            setStatus('idle');
            onToast('AI 返回空内容', 'error');
            return;
          }

          if (res.content.trim() === contentRef.current.trim()) {
            setStatus('idle');
            onToast('AI 认为无需修改', 'info');
            return;
          }

          // 进入 diff 阶段
          const parsed = parseDiff(contentRef.current, res.content);
          if (parsed.length === 0) {
            setStatus('idle');
            onToast('无差异', 'info');
            return;
          }
          setHunks(parsed);
          setStatus('diffing');
        },
        onError: (msg) => {
          if (msg === '已取消') {
            onToast('已取消', 'info');
          } else {
            onToast(sanitizeText(msg), 'error');
          }
          setStatus('idle');
          setError(sanitizeText(msg));
        },
      });
    },
    [pendingAction, vendor, desensitize, onToast],
  );

  const cancel = useCallback(() => {
    if (status === 'confirming') {
      reset();
      onToast('已取消发送', 'info');
      return;
    }
    cancelAI();
    setStatus('idle');
    setStream('');
    onToast('已取消', 'info');
  }, [status, reset, onToast]);

  const applySelected = useCallback(
    (selectedIds: Set<number>) => {
      if (hunks.length === 0 || !result) return;
      const newContent = applyDiffHunks(contentRef.current, hunks, selectedIds);
      onApply(newContent);
      setStatus('applied');
      onToast(`已应用 ${selectedIds.size}/${hunks.length} 处修改`, 'success');
      setTimeout(() => reset(), 1500);
    },
    [hunks, result, onApply, onToast, reset],
  );

  const reject = useCallback(() => {
    reset();
    onToast('已拒绝 AI 修改', 'info');
  }, [reset, onToast]);

  return {
    status,
    stream,
    result,
    error,
    hunks,
    lastAction,
    pendingAction,
    pendingPreview,
    run,
    confirmSend,
    cancel,
    applySelected,
    reject,
    reset,
  };
}
