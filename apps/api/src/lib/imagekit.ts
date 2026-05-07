import "dotenv/config"
import ImageKit from "imagekit";

const privateKey = process.env.IMAGEKIT_PRIVATE_KEY!;
const publicKey = process.env.IMAGEKIT_PUBLIC_KEY!;
const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT!;

const imagekit = new ImageKit({
  privateKey,
  publicKey,
  urlEndpoint,
});

export default imagekit
