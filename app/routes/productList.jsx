
import { Button, IndexTable, LegacyCard, Text, useIndexResourceState } from "@shopify/polaris";
import { useNavigate } from "@remix-run/react";

export default function ProductList({ Products }) {
    const navigate = useNavigate();
    const resourceName = {
        singular: 'product',
        plural: 'products',
    };

    const { selectedResources, allResourcesSelected, handleSelectionChange } =
        useIndexResourceState(Products);

    const rowMarkup = Products ? Products.map(
        (
            { id, title, handle, status, vendor },
            index,
        ) => (
            <IndexTable.Row
                id={id}
                key={id}
                position={index}
            >
                <IndexTable.Cell>
                    <Text variant="bodyMd" fontWeight="bold" as="span">
                        {title}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>{status}</IndexTable.Cell>
                <IndexTable.Cell>{vendor}</IndexTable.Cell>
                <IndexTable.Cell>
                    <Button onClick={() => { navigate(`issues/${id}`) }}>
                        View Issues
                    </Button>
                </IndexTable.Cell>
            </IndexTable.Row>
        ),
    ) : null;

    return (
        <LegacyCard>
            <IndexTable
                resourceName={resourceName}
                itemCount={Products ? Products.length : 0}

                onSelectionChange={handleSelectionChange}
                headings={[
                    { title: 'Product Name' },
                    { title: 'Status' },
                    { title: 'vendor' },
                ]}
            >
                {rowMarkup}
            </IndexTable>
        </LegacyCard>
    )
}