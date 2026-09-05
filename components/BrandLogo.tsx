import Image from 'next/image';
import Link from 'next/link';

interface BrandLogoProps {
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  href?: string;
}

export default function BrandLogo({
  className = '',
  imageClassName = 'h-10 w-10',
  priority = false,
  href = '/',
}: BrandLogoProps) {
  const logo = (
    <Image
      src="/multiverse-logo.png"
      alt="Multiverse.io"
      width={370}
      height={360}
      priority={priority}
      className={`object-contain drop-shadow-[0_0_18px_rgba(77,145,255,0.35)] ${imageClassName}`}
    />
  );

  return href ? (
    <Link href={href} aria-label="Multiverse.io home" className={`inline-flex ${className}`}>
      {logo}
    </Link>
  ) : (
    <span className={`inline-flex ${className}`}>{logo}</span>
  );
}
