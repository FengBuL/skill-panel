import { useMemo } from 'react';

export type SkillQueryItem = {
  modifiedAt: string | null;
  path: string;
};

export type SkillQueryCategory = {
  id: string;
};

export function useSkillQuery<TSkill extends SkillQueryItem, TCategory extends SkillQueryCategory>({
  activeCategoryId,
  activeTagLabel,
  applyCategorySkillOrder,
  categorySkillOrder,
  filterSkills,
  getCategoryLabel,
  getEffectiveSkillCategories,
  getTagCategories,
  isSkillVisible,
  locale,
  page,
  pageSize,
  query,
  skillCategoryNavItems,
  skills,
  sortByNameAscending,
  sortMode,
}: {
  activeCategoryId: string | null;
  activeTagLabel: string | null;
  applyCategorySkillOrder: (skills: TSkill[], order: string[] | undefined) => TSkill[];
  categorySkillOrder: Partial<Record<string, string[]>>;
  filterSkills: (skills: TSkill[], query: string) => TSkill[];
  getCategoryLabel: (category: TCategory) => string;
  getEffectiveSkillCategories: (skill: TSkill) => TCategory[];
  getTagCategories: (skill: TSkill) => TCategory[];
  isSkillVisible: (skill: TSkill) => boolean;
  locale: string;
  page: number;
  pageSize: number;
  query: string;
  skillCategoryNavItems: Array<{ category: TCategory | null }>;
  skills: TSkill[];
  sortByNameAscending: boolean;
  sortMode: 'modified' | 'name' | 'original';
}) {
  const filteredSkills = useMemo(() => {
    const searchMatches = filterSkills(skills, query).filter(isSkillVisible);

    if (activeTagLabel) {
      return searchMatches.filter((skill) => getTagCategories(skill).some((tagCategory) => tagCategory.id === `tag:${activeTagLabel}`));
    }

    if (!activeCategoryId) {
      return searchMatches;
    }

    return searchMatches.filter((skill) => getEffectiveSkillCategories(skill).some((category) => category.id === activeCategoryId));
  }, [activeCategoryId, activeTagLabel, filterSkills, getEffectiveSkillCategories, getTagCategories, isSkillVisible, query, skills]);

  const sortedFilteredSkills = useMemo(() => {
    if (sortMode === 'name' || sortByNameAscending) {
      return [...filteredSkills].sort((leftSkill, rightSkill) =>
        String('name' in leftSkill ? leftSkill.name : '').localeCompare(String('name' in rightSkill ? rightSkill.name : ''), locale),
      );
    }
    if (sortMode === 'modified') {
      return [...filteredSkills].sort((leftSkill, rightSkill) => {
        const leftTime = leftSkill.modifiedAt ? new Date(leftSkill.modifiedAt).getTime() : 0;
        const rightTime = rightSkill.modifiedAt ? new Date(rightSkill.modifiedAt).getTime() : 0;
        return rightTime - leftTime;
      });
    }

    return filteredSkills;
  }, [filteredSkills, locale, sortByNameAscending, sortMode]);

  const totalPages = Math.max(1, Math.ceil(sortedFilteredSkills.length / pageSize));
  const normalizedCurrentPage = Math.min(page, totalPages);

  const paginatedSkills = useMemo(() => {
    const pageStartIndex = (normalizedCurrentPage - 1) * pageSize;
    return sortedFilteredSkills.slice(pageStartIndex, pageStartIndex + pageSize);
  }, [normalizedCurrentPage, pageSize, sortedFilteredSkills]);

  const categorySections = useMemo(() => {
    const sectionMap = new Map<string, { category: TCategory; skills: TSkill[] }>();

    for (const skill of sortedFilteredSkills) {
      const skillCategories = getEffectiveSkillCategories(skill);
      const tagCategories = activeCategoryId || activeTagLabel ? [] : getTagCategories(skill);

      for (const category of [...skillCategories, ...tagCategories]) {
        if (activeCategoryId && category.id !== activeCategoryId) {
          continue;
        }

        const section = sectionMap.get(category.id) ?? { category, skills: [] };
        section.skills.push(skill);
        sectionMap.set(category.id, section);
      }
    }

    return Array.from(sectionMap.values())
      .map((section) => ({
        ...section,
        label: getCategoryLabel(section.category),
        skills: applyCategorySkillOrder(section.skills, categorySkillOrder[section.category.id]),
      }))
      .sort((leftSection, rightSection) => leftSection.label.localeCompare(rightSection.label, locale));
  }, [
    activeCategoryId,
    activeTagLabel,
    applyCategorySkillOrder,
    categorySkillOrder,
    getCategoryLabel,
    getEffectiveSkillCategories,
    getTagCategories,
    locale,
    sortedFilteredSkills,
  ]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = Object.fromEntries(
      skillCategoryNavItems.flatMap((item) => (item.category ? [[item.category.id, 0]] : [])),
    );

    for (const skill of skills) {
      for (const category of getEffectiveSkillCategories(skill)) {
        counts[category.id] = (counts[category.id] ?? 0) + 1;
      }
    }

    return counts;
  }, [getEffectiveSkillCategories, skillCategoryNavItems, skills]);

  return {
    categoryCounts,
    categorySections,
    filteredSkills,
    normalizedCurrentPage,
    paginatedSkills,
    sortedFilteredSkills,
    totalPages,
  };
}
