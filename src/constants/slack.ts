export const MAX_SLACK_UPLOAD_BYTES = 128 * 1024;

export const SLACK_API_TOKEN_PATTERN = /"api_token":"(xox[a-z]-[^"]+)"/;

export const SLACK_ERROR_MESSAGES: Readonly<Record<string, string>> = {
  error_name_taken: "An emoji with this name already exists",
  resized_but_still_too_large: "The image is too large for Slack, even after resizing",
};

export const SLACK_ACTIVE_SORT_HEADER_SELECTOR = ".p-customize_emoji_list__header--active";

export const SLACK_EMOJI_NAME_PATTERN = /^[a-z0-9_-]{1,100}$/;
