import { contentfulClient } from "~/contentful-client";
import { graphql } from "~/gql";

const GET_PAGES = graphql(`
  query GET_PAGES {
    pageCollection {
      items {
        sys {
          id
        }
      }
    }
  }
`);

export default async function Home() {
  const pages = await contentfulClient.request(GET_PAGES);
  console.log(pages);

  return <div>Hi</div>;
}
