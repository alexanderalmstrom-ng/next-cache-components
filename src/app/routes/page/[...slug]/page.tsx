import { Suspense } from "react";

type ContentPageRouteProps = PageProps<"/routes/page/[...slug]">;
type ContentPagePathProps = {
  params: ContentPageRouteProps["params"];
};

function formatPath(slug: string[] = []) {
  return `/${slug.join("/")}`;
}

export default function ContentPageRoute({ params }: ContentPageRouteProps) {
  return (
    <main>
      <h1>Page</h1>
      <Suspense fallback={<p>Loading page path...</p>}>
        <ContentPagePath params={params} />
      </Suspense>
    </main>
  );
}

async function ContentPagePath({ params }: ContentPagePathProps) {
  const { slug } = await params;

  return <p>{formatPath(slug)}</p>;
}
