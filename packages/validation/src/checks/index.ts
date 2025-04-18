import { validate as checkAllowedFileTypes } from "./allowed-file-types.js";
import { validate as checkStrictTimestampOrdering } from "./strict-timestamp-ordering.js";
import { validate as checkSameDevice } from "./same-device.js";
import { validate as checkTimeframe } from "./timeframe.js";
import { validate as checkModified } from "./modified.js";
import { validate as checkFileSize } from "./filesize.js";

export {
  checkAllowedFileTypes,
  checkStrictTimestampOrdering,
  checkSameDevice,
  checkTimeframe,
  checkModified,
  checkFileSize,
};
