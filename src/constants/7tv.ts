export const SEVEN_TV_API_URL = "https://7tv.io/v3";

export const SEVEN_TV_EMOTE_FIELDS =
  "items { id name animated host { url files { name format size } } }";

export const SEVEN_TV_SEARCH_QUERY = `query Search($query: String!, $page: Int!, $limit: Int!) {
  emotes(query: $query, page: $page, limit: $limit) { ${SEVEN_TV_EMOTE_FIELDS} }
}`;

export const SEVEN_TV_POPULAR_QUERY = `query Popular($page: Int!, $limit: Int!) {
  emotes(query: "", page: $page, limit: $limit, filter: { exact_match: false }, sort: { value: "popularity", order: DESCENDING }) { ${SEVEN_TV_EMOTE_FIELDS} }
}`;
