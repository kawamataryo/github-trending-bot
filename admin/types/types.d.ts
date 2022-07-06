type Trend = {
  id: string;
  description: string;
  starCount: string;
  ownersTwitterAccount: string;
  createdAt: number;
  tweeted: boolean;
  todayStarCount: string;
  repository: string;
  url: string;
  language: string;
  forkCount: string;
  owner: string;
};

type CollectionName = "all" | "frontend" | "python" | "rust";
