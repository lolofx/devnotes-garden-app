// Matches [text](href) but not ![alt](src) — href must be relative (not http, /, #)
const RELATIVE_MARKDOWN_LINK = /(?<!!)\[([^\]]+)\]\((?!https?:\/\/|\/|#)([^)]+)\)/g;

export function rewriteNoteLinks(content: string): string {
  return content.replace(RELATIVE_MARKDOWN_LINK, (_, text: string, href: string) => {
    const basename = href.split('/').pop() ?? href;
    const slug = basename.replace(/\.md$/, '');
    return `[${text}](/notes/${slug})`;
  });
}
