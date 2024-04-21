export interface IPage {
  url: string;
  title?: string;
  content?: string | null;
  status?: string;
  error?: string | null;
}

export class Page implements IPage {
  url: string;
  title: string | undefined;
  content: string | null;
  status: string;
  error: string | null;

  constructor(page: IPage) {
    this.url = page.url;
    this.title = page.title;
    this.content = page.content ?? null; // Using nullish coalescing operator to handle undefined and null
    this.status = page.status ?? "finished"; // Default value "finished" if status is not provided
    this.error = page.error ?? null; // Using nullish coalescing operator to handle undefined and null
  }

  update(newPage: Partial<IPage>): void {
    if (newPage.url) this.url = newPage.url;
    r: if (newPage.title !== undefined) this.title = newPage.title;
    if (newPage.content !== undefined) this.content = newPage.content ?? null;
    if (newPage.status !== undefined)
      this.status = newPage.status ?? "finished";
    if (newPage.error !== undefined) this.error = newPage.error ?? null;
  }
}
