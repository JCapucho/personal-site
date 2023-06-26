export function formatDate(
  date: Date,
  monthFormat: "short" | "long" = "short"
): string {
  const year = new Intl.DateTimeFormat("en-GB", { year: "numeric" }).format(
    date
  );
  const month = new Intl.DateTimeFormat("en-GB", { month: monthFormat }).format(
    date
  );
  const day = new Intl.DateTimeFormat("en-GB", { day: "numeric" }).format(date);

  return `${year} ${month} ${day}`;
}

export interface ArticleMetadata {
  language: string;
  image?: { src: string; alt: string } | undefined;
  publishDate: Date;
  lastEditDate?: Date | undefined;
  tags: string[];
}
