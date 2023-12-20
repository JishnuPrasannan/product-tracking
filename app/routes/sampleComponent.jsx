import { Outlet } from "@remix-run/react";
import { Layout, Page, VerticalStack } from "@shopify/polaris";

export default function Sample(props) {
    const {id} = props;
    console.log('id',id)
    return (
        <Page>
            <ui-title-bar title="Products">
            </ui-title-bar>

            <VerticalStack gap="10">
                <Layout>
                    <Layout.Section>
                        Hello Again
                    </Layout.Section>
                </Layout>
            </VerticalStack>
        </Page>
    )
}