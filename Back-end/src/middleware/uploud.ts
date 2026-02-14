import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, "uploads/");
  },
  filename: (_, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.random().toString(9).substring(2);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

export const upload = multer({ storage });
