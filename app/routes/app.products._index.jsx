import { json } from "@remix-run/node";
import { Button, IndexTable, Layout, LegacyCard, Page, Text, useIndexResourceState } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { getProducts } from "../models/Products.server";
import { Outlet, useLoaderData, useNavigate } from "@remix-run/react";

import ProductList from "./productList";

export async function loader({ request }) {
    const { admin, session } = await authenticate.admin(request);
    const Products = await getProducts(session.shop, admin.graphql);
    return json({
        Products,
    });
}

export default function Products() {
    const { Products } = useLoaderData();

    return (
        <Page>
            <ui-title-bar title="Products">
            </ui-title-bar>
            <Layout>
                <Layout.Section>
                    <ProductList Products={Products} />
                </Layout.Section>
            </Layout>
        </Page>
    )
}