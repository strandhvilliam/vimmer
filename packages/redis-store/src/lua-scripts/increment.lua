---@diagnostic disable: undefined-global


local result = { "PROCESSED_SUBMISSION"}

local orderIndex = tonumber(ARGV[1]) + 1 -- 1-based index

if not orderIndex or orderIndex < 0 then
  return { "INVALID_ORDER_INDEX" }
end

local alreadyFinalized = redis.call("HGET", KEYS[1], "finalized")


if alreadyFinalized == 1 then
  return { "ALREADY_FINALIZED" }
end

local processedIndexesJson = redis.call("HGET", KEYS[1], "processedIndexes")
local expectedCount = tonumber(redis.call("HGET", KEYS[1], "expectedCount"))

if not processedIndexesJson or not expectedCount then
  return { "MISSING_DATA" }
end

local processedIndexes = cjson.decode(processedIndexesJson)

if orderIndex > #processedIndexes then
  return { "INVALID_ORDER_INDEX" }
end

if processedIndexes[orderIndex] == 1 then
  return { "DUPLICATE_ORDER_INDEX" }
end

processedIndexes[orderIndex] = 1

redis.call("HSET", KEYS[1], "processedIndexes", cjson.encode(processedIndexes))

local processedCount = 0

for i = 1, #processedIndexes do
  if processedIndexes[i] == 1 then
    processedCount = processedCount + 1
  end
end

if expectedCount <= processedCount then
  redis.call("HSET", KEYS[1], "finalized", 1)
  result[1] = "FINALIZED"
end


return result
