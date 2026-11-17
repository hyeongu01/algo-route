// 문제 id("leetcode:two-sum")의 ':'는 Windows 파일명/정적 export 경로에서 문제가 되므로 URL에는 '_'를 쓴다.
// 플랫폼 이름에는 '_'가 없으므로 첫 '_'만 ':'로 되돌리면 된다.
export const problemHref = (id: string) => `/problems/${id.replace(":", "_")}`;
export const idFromSlug = (slug: string) => decodeURIComponent(slug).replace("_", ":");
export const slugOf = (id: string) => id.replace(":", "_");
