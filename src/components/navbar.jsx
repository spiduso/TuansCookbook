import {useEffect, useState} from 'react';
import {DynamoDBClient, ScanCommand} from '@aws-sdk/client-dynamodb'
import {useNavigate} from "react-router-dom";

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

import Form from 'react-bootstrap/Form';
import SearchableDropdown from "./searchableDropdown.jsx";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import {Link} from "react-router-dom";

function MyNavbar() {
    const [recipes, setRecipes] = useState([]);
    const [value, setValue] = useState("Filter recipes");
    const navigate = useNavigate()

    useEffect(() => {
        async function fetchDropDownData() {
            const dbClient = new DynamoDBClient({
                region: import.meta.env.VITE_DYNAMODB_REGION,
                credentials: {
                    accessKeyId: import.meta.env.VITE_DYNAMODB_ACCESS_KEY_ID,
                    secretAccessKey: import.meta.env.VITE_DYNAMODB_SECRET_ACCESS_KEY
                }
            })

            const response = await getRecipes(dbClient)
            setRecipes(response);
        }

        if (recipes.length === 0) {
            fetchDropDownData().then();
        }
    }, [recipes.length]);

    return (
        <Navbar expand="lg" className="bg-body-tertiary">
            <Container>
                <Navbar.Brand as={Link} to={'/'}>Tuan&apos;s Cookbook</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Form onSubmit={submitHandler} onMouseDown={selectHandler}>
                            <Row>
                                <Col xs="auto">
                                    <SearchableDropdown
                                        options={recipes}
                                        label="name"
                                        id="id"
                                        selectedVal={value}
                                        handleChange={(val) => setValue(val)}
                                    />
                                </Col>
                            </Row>
                        </Form>
                        <Nav.Link as={Link} to={'/'}>Show All Recipes</Nav.Link>
                        <Nav.Link as={Link} to={'/add'}>Add Recipe</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );

    function submitHandler(e) {
        e.preventDefault();
        let found = false;
        for (let i = 0; i < recipes.length && !found; i++) {
            if (recipes[i].name.toLowerCase().includes(e.target[0].value.toLowerCase())) {
                found = true;
                navigate(`/recipe/${recipes[i].name}`)
            }
        }
    }

    function selectHandler(e) {
        if (e.target.classList.length > 0) {
            navigate(`/recipe/${e.target.innerHTML}`)
        }
    }

    async function getRecipes(dbClient) {
        let id = 1;
        const recipes = []
        const input = {TableName: 'Recipes'}
        let scan = await dbClient.send(new ScanCommand(input))

        while (scan.LastEvaluatedKey !== undefined) {
            scan.Items.forEach(function (item,) {
                recipes.push({id, name: item.Name.S})
                id += 1
            })

            input.ExclusiveStartKey = scan.LastEvaluatedKey
            scan = await dbClient.send(new ScanCommand(input))
        }

        if (scan.Items !== undefined) {
            scan.Items.forEach(function (item,) {
                recipes.push({id, name: item.Name.S})
                id += 1
            })
        }

        return recipes
    }
}

export default MyNavbar;