import { notFound } from "next/navigation";
import { getBikeById } from "@/app/actions/bikes";
import BikeDetail from "@/components/bike/bike-detail";

export const dynamic = "force-dynamic";

interface BikeDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: BikeDetailPageProps) {
  const { id } = await params;
  const bike = await getBikeById(id);
  if (!bike) return { title: "车型未找到 · VELOX" };
  return {
    title: `${bike.brand.name} ${bike.model} · VELOX`,
    description: bike.description ?? `${bike.brand.name} ${bike.model} — 详细配置、几何数据与实拍图`,
  };
}

export default async function BikeDetailPage({ params }: BikeDetailPageProps) {
  const { id } = await params;
  const bike = await getBikeById(id);

  if (!bike) {
    notFound();
  }

  return <BikeDetail bike={bike} />;
}
