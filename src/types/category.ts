export const enum ActiveCategory {
  all = 0,
  poaps = 1,
  sol = 2,
  eth = 3,
  near = 4,
}

export type CategoryLengths = {
  [key in ActiveCategory]: Length;
};

export type Length = {
  length: number;
  isMore: boolean;
};

export const defaultLength: Length = {
  length: 0,
  isMore: false,
};

export const defaultCategoryLengths: CategoryLengths = {
  [ActiveCategory.all]: defaultLength,
  [ActiveCategory.poaps]: defaultLength,
  [ActiveCategory.sol]: defaultLength,
  [ActiveCategory.eth]: defaultLength,
  [ActiveCategory.near]: defaultLength,
};
