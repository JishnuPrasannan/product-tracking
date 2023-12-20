async function getProducts(shop, graphql) {
  const response = await graphql(
    `
      query {
        products(first: 10, reverse: true) {
          edges {
            node {
              id
              title
              handle
              status
              vendor
            }
          }
        }
      }
    `
  );

  const responseJson = await response.json();
  const products = responseJson.data.products.edges;
  let productDetails = [];
  Object.entries(products).forEach((entry) => {
    const [key, value] = entry;

    const gid = value.node.id;
    const id = gid.split("/").pop();
    let data = {
      gid: gid,
      id: id,
      title: value.node.title,
      handle: value.node.handle,
      status: value.node.status,
      vendor: value.node.vendor,
    };
    productDetails.push(data);
  });

  return productDetails;
}

async function getProduct(shop, graphql, productId) {
  productId = `gid://shopify/Product/${productId}`;
  const response = await graphql(
    `query {
      product(id: "${productId}") {
        title
        description
        metafield(key: "product-issue", namespace: "p80") {
          value
        }
      }
    }`
  );

  const responseJson = await response.json();
  const product = responseJson.data;
  return product;
}

async function updateIssues(id, newIssues, graphql) {
  // This example uses metafields to store the data. For more information, refer to https://shopify.dev/docs/apps/custom-data/metafields.
  const createMetaResponse = await createMetafieldDefinition(graphql);
  if (createMetaResponse.status != "success") {
    return createMetaResponse.message;
  }

  let oldIssues = await getMetafield(graphql, id);
  delete newIssues.shop;
  // let jsonIssues = JSON.parse(oldIssues);

  let allIssues = [];
  let $i = 1;
  oldIssues.map(function (val, index) {
    allIssues.push(val);
    $i++;
  });
  newIssues["id"] = $i;
  allIssues.push(newIssues);

  const response = await graphql(
    `
      mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            key
            namespace
            value
            createdAt
            updatedAt
          }
          userErrors {
            field
            message
            code
          }
        }
      }
    `,
    {
      variables: {
        metafields: [
          {
            key: "track-product-issues",
            namespace: "p80",
            ownerId: `gid://shopify/Product/${id}`,
            type: "json",
            value: JSON.stringify(allIssues),
          },
        ],
      },
    }
  );
  const responseJson = await response.json();

  const metaFieldErrors = responseJson.data.metafieldsSet.userErrors;
  if (Array.isArray(metaFieldErrors) && metaFieldErrors.length > 0) {
    return { status: "error", message: metaFieldErrors[0].message };
  }

  return { status: "success" };
}

async function createMetafieldDefinition(graphql) {
  const response = await graphql(
    `
      mutation CreateMetafieldDefinition(
        $definition: MetafieldDefinitionInput!
      ) {
        metafieldDefinitionCreate(definition: $definition) {
          createdDefinition {
            id
            name
          }
          userErrors {
            field
            message
            code
          }
        }
      }
    `,

    {
      variables: {
        definition: {
          name: "Track Product Issues",
          namespace: "p80",
          key: "track-product-issues",
          description: "Track Product Issues",
          type: "json",
          ownerType: "PRODUCT",
        },
      },
    }
  );
  const responseJson = await response.json();
  const metaFieldErrors =
    responseJson.data.metafieldDefinitionCreate.userErrors;
  const metaFieldData = responseJson.data.metafieldDefinitionCreate;

  if (
    Array.isArray(metaFieldErrors) &&
    metaFieldErrors.length > 0 &&
    metaFieldErrors[0]?.code != "TAKEN"
  ) {
    return { status: "error", message: metaFieldErrors[0].message };
  }

  return { status: "success" };
}

async function getMetafield(graphql, productId) {
  productId = `gid://shopify/Product/${productId}`;
  const response = await graphql(
    `
      query Product($id: ID!) {
        product(id: $id) {
          metafield(namespace: "p80", key: "track-product-issues") {
            value
          }
        }
      }
    `,
    { variables: { id: productId } }
  );

  const responseJson = await response.json();

  const metafields = JSON.parse(responseJson.data.product.metafield.value);
  return metafields;
}

module.exports = {
  getProducts: getProducts,
  getProduct: getProduct,
  updateIssues: updateIssues,
  getMetafield: getMetafield,
};
