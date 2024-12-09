const axios = require("axios")

function sum(a,b){
    return a+b
}

const BACKEND_URL = "http://localhost:3000"

describe("Authentication",  () =>{
    test('User is able to sign up only once', async() => { 
        const username = "kirat" + Math.random()
        const password =  "123456"

        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        })
        expect(response.statusCode).toBe(200)

        const Updatedresponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        })
        expect(Updatedresponse.statusCode).toBe(400)
     })
    
    test("SignUp request fails if the username is empty", async() =>{
        const username = `akhil-${Math.random()}`
        password = "123456"

        const res = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            password
        })

        expect(res.statusCode).toBe(400)

    })

    test('Signin succeeds if the username and password are correct', async () =>{
        const username = `akhil-${Math.random()}`
        password= "123456"

        await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        })
        

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password,
        })

        expect(response.statusCode).toBe(200)
        expect(response.body.token).toBeDefined()
    })

    test('Signin fails if the username and password are incorrect', async () =>{
        const username = `akhil-${Math.random()}`
        password= "123456"

        await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        })
        

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username: "WrongUserName",
            password,
        })

        expect(response.statusCode).toBe(403)
    })
})

describe("User Metadata endpoints", () =>{
    let token = ''
    let avatarId = ''
    beforeAll(async() =>{
        const username = `kirat-${Math.random()}`
        const password= '123456'

        await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        })
        

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password,
        })

        token = response.data.token

        const avaterResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
	        "name": "Timmy"
        })

        avatarId = avaterResponse.data.avatarId

    })

    test("User cant Update there metadata with a wrong avatarId " , async() => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId: "123456464"
        },{
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })

        expect(response.statusCode).toBe(400)
    })

    test("User Can update their metadata with right avaterId", async() =>{
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId
        },{
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })

        expect(response.statusCode).toBe(200)
    })

    test("User is not able to update the metadata if the auth header is not present", async() =>{
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId
        })

        expect(response.statusCode).toBe(403)
    })
})

describe("user avatars information", () =>{
    
    let avatarId = ''
    let token = ''
    let userId = ''
    beforeAll(async() =>{
        const username = `kirat-${Math.random()}`
        const password= '123456'

        const signUpResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        })
        
        userId = signUpResponse.data.userId

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password,
        })

        token = response.data.token

        const avaterResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
	        "name": "Timmy"
        })

        avatarId = avaterResponse.data.avatarId
    })

    test("Get back avatar information for the user", async () =>{
        const response = await axios.get(`${BACKEND_URL}/api/v1/user/metadata/bulk?ids=[${userId}]`)
        
        expect(response.data.avatars.length).toBe(1);
    })

    test("Available avatars lists the recently created avatar", async() =>{
        const response =  await axios.post(`${BACKEND_URL}/api/v1/avatars`)
        expect(response.data.avatars.length).not.toBe(0)

        const currentAvatar = response.data.avatars.find(x => x.id == avatarId)
        expect(currentAvatar).toBeDefined()
    })
})

describe("Space Information", () =>{
    let mapId;
    let element1Id;
    let element2Id;
    let adminToken;
    let adminId;

    let userToken;
    let userId;

    beforeAll(async() =>{
        const username = `akhil-${Math.random()}`
        const password= '123456'

        const signUpResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        })

        
        
        adminId = signUpResponse.data.userId

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password,
        })

        adminToken = response.data.token

        const userSignUpResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username: username + "-user",
            password,
            type: "user"
        })

        
        
        userId = userSignUpResponse.data.userId

        const userSignInResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username: username + "-user",
            password,
        })

        userToken = userSignInResponse.data.token

        const element1 = await axios.post(`${BACKEND_URL}/api/vi/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
        },{
            headers: {
                authorization: `Bearer ${adminToken}`
            }
        })

        const element2 = await axios.post(`${BACKEND_URL}/api/vi/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
        },{
            headers: {
                authorization: `Bearer ${adminToken}`
            }
        })

        element1Id = element1.data.id
        element2Id = element2.data.id

        const map = await axios.post(`${BACKEND_URL}/api/v1/admin/map`,{
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "name": "100 person interview room",
            "defaultElements": [{
                    elementId: element1Id,
                    x: 20,
                    y: 20
                }, {
                  elementId: element1Id,
                    x: 18,
                    y: 20
                }, {
                  elementId: element2Id,
                    x: 19,
                    y: 20
                }, {
                  elementId: element2Id,
                    x: 19,
                    y: 20
                }
            ]
         },{
            headers: {
                authorization: `Bearer ${adminToken}`
            }
        })

        mapId = map.data.id

    })

    test("User is able to create a space", async() =>{
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name": "Test",
            "dimensions": "100x200",
            "mapIDd": mapId
        },{
            headers: {
                authorization: `Bearer ${userToken}`
            }
        })

        expect(response.spaceId).toBeDefined()
    })

    test("User is able to create a space without mapId", async() =>{
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name": "Test",
            "dimensions": "100x200",
        }, {
            headers: {
                authorization: `Bearer ${userToken}`
            }
        })

        expect(response.spaceId).toBeDefined()
    })

    test("User is not  able to create a space without mapId and dimension", async() =>{
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name": "Test",
        }, {
            headers: {
                authorization: `Bearer ${userToken}`
            }
        })

        expect(response.statusCode).toBe(400)
    })

    test("User is not  able to delete a space that doesn't exist", async() =>{
        const response = await axios.delete(`${BACKEND_URL}/api/v1/space/randomIdDosentExist`, {
            headers: {
                authorization: `Bearer ${userToken}`
            }
        })

        expect(response.statusCode).toBe(400)
    })

    test("User is able to delete a space that does exist", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name": "Test",
            "dimensions": "100x200",
        }, {
            headers: {
                authorization: `Bearer ${userToken}`
            }
        })

        const deleteReponse = await axios.delete(`${BACKEND_URL}/api/v1/space/${response.data.spaceId}`, {
            headers: {
                authorization: `Bearer ${userToken}`
            }
        })

       expect(deleteReponse.status).toBe(200)
    })
})