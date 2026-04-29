import { cacheTag } from "next/cache";
import { contentfulClient } from "~/contentful-client";
import { graphql } from "~/gql";

const GET_PAGES = graphql(`
  query GET_PAGES {
    pageCollection {
      items {
        sys {
          id
        }
        title
      }
    }
  }
`);

export async function PageList() {
  const pages = await getPages();

  return (
    <div>
      {pages?.map((page) => (
        <div key={page?.sys.id}>{page?.title}</div>
      ))}
    </div>
  );
}

async function getPages() {
  "use cache";

  cacheTag("pages");

  const data = await contentfulClient.request(GET_PAGES);

  return data.pageCollection?.items;
}
