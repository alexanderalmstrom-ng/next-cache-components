import { Suspense } from "react";

type ProductListingRoutePageProps =
  PageProps<"/routes/product-listing/[[...slug]]">;
type ProductListingPathProps = {
  params: ProductListingRoutePageProps["params"];
};

function formatPath(slug: string[] = []) {
  return `/${slug.join("/")}`;
}

export default function ProductListingRoutePage({
  params,
}: ProductListingRoutePageProps) {
  return (
    <main>
      <h1>Product listing page</h1>
      <Suspense fallback={<p>Loading product listing path...</p>}>
        <ProductListingPath params={params} />
      </Suspense>
    </main>
  );
}

async function ProductListingPath({ params }: ProductListingPathProps) {
  const { slug } = await params;

  return <p>{formatPath(slug)}</p>;
}
