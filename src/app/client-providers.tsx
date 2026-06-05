"use client";
import dynamic from "next/dynamic";

const Providers = dynamic(
  () => import("./providers").then((mod) => mod.Providers),
  { ssr: false }
);

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Providers>{children}</Providers>;
}
