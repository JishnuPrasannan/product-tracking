import { json, redirect } from "@remix-run/node";
import { useActionData, useLoaderData, useNavigate, useNavigation, useSubmit } from "@remix-run/react";
import { Box, Button, Card, DataTable, Layout, LegacyCard, Page, PageActions, TextField, } from "@shopify/polaris";
import { useCallback, useEffect, useState } from "react";
import { getMetafield, updateIssues } from "../models/Products.server";
import { authenticate } from "../shopify.server";
import Buttons from "./Buttons";

let rows = []
export async function loader({ request, params }) {
    console.log('loader function')
    const { admin, session } = await authenticate.admin(request);
    const productId = params.productId;
    const metafields = await getMetafield(admin.graphql, productId);

    return json(metafields);
}

export async function action({ request, params }) {
    const { admin, session } = await authenticate.admin(request);
    const { shop } = session;


    const data = {
        ...Object.fromEntries(await request.formData()),
        shop,
    };

    if (!data) {
        return null;
    }

    const response = await updateIssues(params.productId, data, admin.graphql);
    if (response.status == 'success') {
        return redirect(`/app/products`);
    }
    return response.message;
}

export default function ProductIssues() {
    const errors = useActionData()?.errors || {};
    const metafields = useLoaderData();
    const [issue, setIssue] = useState({ title: "", description: "" });
    const [formErrors, setFormErrors] = useState(null);
    const { title, description } = issue;
    const navigate = useNavigate();

    const nav = useNavigation();
    const isSaving = nav.state === "submitting" && nav.formMethod === "POST";

    rows = []
    metafields.map(function (val, index) {
        rows.push([val.issue, val.description, <Buttons id={val.id}/>]);
    });


    const submit = useSubmit();
    function handleSave() {
        const data = {
            issue: issue.title,
            description: issue.description || "",

        };

        // setCleanFormState({ ...formState });
        submit(data, { method: "post" });
    }

    return (
        <>
            <Page>
                <ui-title-bar title="Product">
                    <button variant="primary" onClick={() => { navigate("/app/products") }}>
                        Back
                    </button>
                </ui-title-bar>
                <LegacyCard >
                    <LegacyCard.Header
                        title="Track Product Issue"
                    >
                    </LegacyCard.Header>
                    <Layout>
                        <Layout.Section>
                            <DataTable
                                columnContentTypes={[
                                    'text',
                                    'text',

                                ]}
                                headings={[
                                    'Title',
                                    'Issue',
                                    'Action'
                                ]}
                                rows={rows}

                            />
                        </Layout.Section>
                    </Layout>
                </LegacyCard>
            </Page>
            <Page>
                <Card>
                    <Layout>
                        <Layout.Section>
                            <LegacyCard
                                title="Add A New Issue"
                            >
                                <LegacyCard.Section >

                                    <TextField
                                        value={title}
                                        error={formErrors ? "Please enter a title" : undefined}
                                        onChange={(val) => setIssue((prev) => ({ ...prev, title: val }))}
                                        label="Title"
                                        autoComplete="off"
                                    />
                                </LegacyCard.Section>

                                <LegacyCard.Section >
                                    <TextField
                                        value={description}
                                        error={formErrors ? "Please enter a description" : undefined
                                        }
                                        onChange={(val) =>
                                            setIssue((prev) => ({ ...prev, description: val }))
                                        }
                                        label="Description"
                                        autoComplete="off"
                                        multiline={10}
                                    />
                                </LegacyCard.Section>
                            </LegacyCard>
                        </Layout.Section>
                        <Layout.Section>
                            <PageActions
                                secondaryActions={[
                                    {
                                        content: "Cancel",
                                    },
                                ]}
                                primaryAction={{
                                    content: "Save",
                                    loading: isSaving,
                                    // disabled: !isDirty || isSaving || isDeleting,
                                    disabled: isSaving,
                                    onAction: handleSave,
                                }}
                            />
                        </Layout.Section>
                    </Layout>
                </Card>
            </Page>
        </>
    );
}

