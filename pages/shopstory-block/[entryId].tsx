import type { NextPage, GetStaticProps, GetStaticPaths } from 'next'
import { RenderableContentPiece, Metadata } from "@shopstory/core";
import { createClient, Entry } from 'contentful'
import { ShopstoryClient } from "@shopstory/core/client";
import { Shopstory, ShopstoryMetadataProvider } from "@shopstory/core/react";
import {shopstoryConfig} from "../../src/shopstory/config";
import {DemoShopstoryProvider} from "../../src/shopstory/provider";

type ShopstoryBlockPageProps = {
  content: RenderableContentPiece
  meta: Metadata
}

const ShopstoryBlockPage: NextPage<ShopstoryBlockPageProps> = (props) => {
  return <DemoShopstoryProvider>
    <ShopstoryMetadataProvider meta={props.meta}>
      <Shopstory content={props.content} />
    </ShopstoryMetadataProvider>
  </DemoShopstoryProvider>
}

export const getStaticPaths: GetStaticPaths = () => {
  return { paths: [], fallback: 'blocking' }
}

export const getStaticProps: GetStaticProps<ShopstoryBlockPageProps, { entryId: string }> = async (context) => {
  let { params, preview, locale = 'en-US' } = context

  if (!params) {
    return { notFound: true }
  }

  const contentfulClient = createClient({
    space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE!,
    environment: process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT ?? "master",
    accessToken: preview ? process.env.NEXT_PUBLIC_CONTENTFUL_PREVIEW_ACCESS_TOKEN! : process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN!,
    host: preview ? 'preview.contentful.com' : undefined
  })

  const entry : Entry<any> = await contentfulClient.getEntry(params.entryId, {
    content_type: 'shopstoryBlock',
    locale,
  });

  const shopstoryClient = new ShopstoryClient(shopstoryConfig, { locale, contentful: { preview } });
  const content = shopstoryClient.add(entry.fields.config);
  const meta = await shopstoryClient.fetch();

  return {
    props: { content, meta },
    revalidate: 10
  }
}

export default ShopstoryBlockPage
