import { validate as checkAllowedFileTypes } from "./allowed-file-types";
import { validate as checkStrictTimestampOrdering } from "./strict-timestamp-ordering";
import { validate as checkSameDevice } from "./same-device";
import { validate as checkTimeframe } from "./timeframe";
import { validate as checkModified } from "./modified";
import { validate as checkFileSize } from "./filesize";

export {
  checkAllowedFileTypes,
  checkStrictTimestampOrdering,
  checkSameDevice,
  checkTimeframe,
  checkModified,
  checkFileSize,
};
