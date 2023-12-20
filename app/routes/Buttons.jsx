import { Button, ButtonGroup, Icon } from "@shopify/polaris"
import { EditMajor } from '@shopify/polaris-icons';
import { DeleteMajor } from '@shopify/polaris-icons';

export default function Buttons(props) {

    const { id } = props;
    console.log('id', id)

    return (
        <ButtonGroup>
            <Button><Icon
                source={EditMajor}
                color="base"
            /></Button>
            <Button><Icon
                source={DeleteMajor}
                color="base"
            /></Button>
        </ButtonGroup >
    )
}