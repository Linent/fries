import Image from "next/image";

export default function LogoFries() {
  return (
    <Image
      src="/favicon.png"
      alt="Logo Fries"
      width={200}
      height={200}
      className="object-contain mb-4"
      priority
    />
  );
}
