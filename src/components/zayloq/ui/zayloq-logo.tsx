import Image from "next/image";

export function ZayloqLogo() {
  return (
    <div className="w-[150px] sm:w-[170px] md:w-[190px]">
      <Image
        src="/brand/zayloq-logo.png"
        alt="Zayloq"
        width={190}
        height={56}
        priority
        sizes="(max-width: 640px) 150px, (max-width: 768px) 170px, 190px"
        className="block h-auto w-full object-contain"
      />
    </div>
  );
}
