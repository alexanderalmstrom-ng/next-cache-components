import { Suspense } from "react";

type ProductRoutePageProps = PageProps<"/routes/product/[...slug]">;
type ProductPathProps = {
  params: ProductRoutePageProps["params"];
};

function formatPath(slug: string[] = []) {
  return `/${slug.join("/")}`;
}

export default function ProductRoutePage({ params }: ProductRoutePageProps) {
  return (
    <main>
      <h1>Product page</h1>
      <Suspense fallback={<p>Loading product path...</p>}>
        <ProductPath params={params} />
      </Suspense>
    </main>
  );
}

async function ProductPath({ params }: ProductPathProps) {
  const { slug } = await params;

  return <p>{formatPath(slug)}</p>;
}
