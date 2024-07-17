import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb'
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';

import Container from 'react-bootstrap/Container';
import MyNavbar from "./components/navbar"

function RecipeApp() {
    const [recipe, setRecipe] = useState(undefined);
    const {state} = useLocation();
    const { name } = state;

    useEffect(() => {
        async function fetchData() {
            await populateRecipeData(name);
        }
        if (recipe === undefined) {
            fetchData();
        }
    }, [name]);

    const contents = recipe === undefined ? <Row>Wait for data to load</Row> :
    <div key={recipe.Name.S}>
        <h1>{recipe.Name.S}</h1>
        <Row>
            <Col sm={6}>
                <h5>Ingredients</h5>
                <ListGroup>
                    {recipe.Ingredients.SS.map(ingredient =>
                        <ListGroup.Item key={ingredient}>{ingredient}</ListGroup.Item>
                    )}
                </ListGroup>
            </Col>
            <Col sm={6}>
                <h5>Steps</h5>
                <ListGroup numbered>
                    {recipe.Steps.SS.map(step =>
                        <ListGroup.Item key={step}>{step}</ListGroup.Item>
                    )}
                </ListGroup>
            </Col>
        </Row>
        <hr />
    </div>

    return (
        <Container>
            <MyNavbar />
            {contents}
        </Container>
    );

    async function populateRecipeData(name) {
        const dbclient = new DynamoDBClient({ region: import.meta.env.VITE_DYNAMODB_REGION, credentials: { accessKeyId: import.meta.env.VITE_DYNAMODB_ACCESS_KEY_ID, secretAccessKey: import.meta.env.VITE_DYNAMODB_SECRET_ACCESS_KEY } })
        const response = await getRecipes(dbclient, name)
        setRecipe(response);
    }

    async function getRecipes(dbclient, name) {
        const input = {
            "Key": {
                "Name": {
                    "S": name
                }
            },
            "TableName": "Recipes"
        };

        const response = await dbclient.send(new GetItemCommand(input))
        return response.Item
    }
}


export default RecipeApp;