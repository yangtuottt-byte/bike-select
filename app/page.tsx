import { getBikes, getBrands } from "@/app/actions/bikes";
import BikeShop from "@/components/bike/bike-shop";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [bikes, brands] = await Promise.all([getBikes(), getBrands()]);

  const mappedBrands = brands.map((b) => ({
    id: b.id,
    name: b.name,
    _count: { bikes: b._count.bikes },
  }));

  return <BikeShop bikes={bikes} brands={mappedBrands} />;
}
