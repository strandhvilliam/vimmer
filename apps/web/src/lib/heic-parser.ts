import heic2any from "heic2any";

export const parseHeic = async (file: File) => {
  const heic = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 1,
  });
  const blob = Array.isArray(heic) ? heic : [heic];
  return new File(
    blob,
    file.name.replace(".heic", ".jpg").replace(".heif", ".jpg"),
    {
      type: "image/jpeg",
    },
  );
};
