export default {
    openapi: "3.0.1",
    info: {
        title: "1362560888 的项目",
        description: "",
        version: "1.0.0",
    },
    tags: [
        {
            name: "测试",
        },
        {
            name: "测试/test",
        },
        {
            name: "测试/test/aaa",
        },
        {
            name: "pet",
        },
    ],
    paths: {
        "/store/inventory": {
            get: {
                summary: "Returns pet inventories by status",
                description: "Returns a map of status codes to quantities",
                tags: [],
                parameters: [],
                responses: {
                    "200": {
                        description: "successful operation",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    additionalProperties: {
                                        type: "integer",
                                        format: "int32",
                                    },
                                },
                                examples: {},
                            },
                        },
                    },
                },
            },
        },
        "/pet/{petId}": {
            post: {
                summary: "Updates a pet in the store with form data",
                description: "",
                tags: ["pet"],
                parameters: [
                    {
                        name: "petId",
                        in: "path",
                        description: "ID of pet that needs to be updated",
                        required: true,
                        schema: {
                            type: "string",
                        },
                    },
                ],
                requestBody: {
                    content: {
                        "application/x-www-form-urlencoded": {
                            schema: {
                                type: "object",
                                properties: {
                                    aaa: {
                                        type: "string",
                                        description: "Updated name of the pet",
                                    },
                                    bbb: {
                                        type: "string",
                                        description:
                                            "Updated status of the pet",
                                    },
                                    cccc: {
                                        type: "string",
                                    },
                                    dddd: {
                                        type: "string",
                                    },
                                    eeee: {
                                        type: "string",
                                    },
                                    ffff: {
                                        type: "string",
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "405": {
                        description: "Invalid input",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {},
                                },
                                examples: {},
                            },
                        },
                    },
                },
            },
        },
        "/test": {
            socket: {
                summary: "接口名称",
                description: "",
                tags: ["测试"],
                parameters: [],
                responses: {
                    "200": {
                        description: "成功",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {},
                                },
                                examples: {},
                            },
                        },
                    },
                },
            },
        },
        "/store/order/{orderId}": {
            delete: {
                summary: "Delete purchase order by ID",
                description:
                    "For valid response try integer IDs with positive integer value.         Negative or non-integer values will generate API errors",
                tags: [],
                parameters: [
                    {
                        name: "orderId",
                        in: "path",
                        description: "ID of the order that needs to be deleted",
                        required: true,
                        schema: {
                            type: "string",
                        },
                    },
                ],
                responses: {
                    "400": {
                        description: "Invalid ID supplied",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {},
                                },
                                examples: {},
                            },
                        },
                    },
                    "404": {
                        description: "Order not found",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {},
                                },
                                examples: {},
                            },
                        },
                    },
                },
            },
            get: {
                summary: "Find purchase order by ID",
                description:
                    "For valid response try integer IDs with value >= 1 and <= 10.         Other values will generated exceptions",
                tags: [],
                parameters: [
                    {
                        name: "orderId",
                        in: "path",
                        description: "ID of pet that needs to be fetched",
                        required: true,
                        schema: {
                            type: "string",
                        },
                    },
                ],
                responses: {
                    "200": {
                        description: "successful operation",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/Order",
                                },
                                examples: {},
                            },
                        },
                    },
                    "400": {
                        description: "Invalid ID supplied",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {},
                                },
                                examples: {},
                            },
                        },
                    },
                    "404": {
                        description: "Order not found",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {},
                                },
                                examples: {},
                            },
                        },
                    },
                },
            },
        },
        "/imgs/b.jpg": {
            get: {
                summary: "接口名称 Copy",
                description: "",
                tags: ["测试"],
                parameters: [
                    {
                        name: "id",
                        in: "query",
                        description: "",
                        required: false,
                        example: "333",
                        schema: {
                            type: "string",
                        },
                    },
                ],
                responses: {
                    "200": {
                        description: "成功",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {},
                                },
                                examples: {},
                            },
                        },
                    },
                },
            },
        },
        "/pet/{petId}/uploadImage": {
            post: {
                summary: "uploads an image",
                description: "",
                tags: ["pet"],
                parameters: [
                    {
                        name: "petId",
                        in: "path",
                        description: "ID of pet to update",
                        required: true,
                        schema: {
                            type: "string",
                        },
                    },
                ],
                requestBody: {
                    content: {
                        "multipart/form-data": {
                            schema: {
                                type: "object",
                                properties: {
                                    additionalMetadata: {
                                        type: "string",
                                        description:
                                            "Additional data to pass to server",
                                    },
                                    file: {
                                        type: "string",
                                        description: "file to upload",
                                        format: "binary",
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "successful operation",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiResponse",
                                },
                                examples: {},
                            },
                        },
                    },
                },
            },
        },
        "/store/order": {
            post: {
                summary: "Place an order for a pet",
                description: "",
                tags: [],
                parameters: [],
                requestBody: {
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/Order",
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "successful operation",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/Order",
                                },
                                examples: {},
                            },
                        },
                    },
                    "400": {
                        description: "Invalid Order",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {},
                                },
                                examples: {},
                            },
                        },
                    },
                },
            },
        },
        "/pet/findByTags": {
            get: {
                summary: "Finds Pets by tags",
                description:
                    "Muliple tags can be provided with comma separated strings. Use         tag1, tag2, tag3 for testing.",
                tags: ["pet"],
                parameters: [
                    {
                        name: "tags",
                        in: "query",
                        description: "Tags to filter by",
                        required: true,
                        schema: {
                            type: "string",
                        },
                    },
                ],
                responses: {
                    "200": {
                        description: "successful operation",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: {
                                        $ref: "#/components/schemas/Pet",
                                    },
                                },
                                examples: {},
                            },
                        },
                    },
                    "400": {
                        description: "Invalid tag value",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {},
                                },
                                examples: {},
                            },
                        },
                    },
                },
            },
        },
    },
    components: {
        schemas: {
            ContestsCategoryDetail: {
                type: "object",
                description: "比赛类别详情",
                properties: {
                    id: {
                        type: "integer",
                        description: "类别 ID",
                    },
                    name: {
                        type: "string",
                        description: "类别名称",
                    },
                },
            },
            Category: {
                type: "object",
                properties: {
                    id: {
                        type: "integer",
                        format: "int64",
                    },
                    name: {
                        type: "string",
                    },
                },
                xml: {
                    name: "Category",
                },
            },
            Category1: {
                type: "object",
                properties: {
                    id: {
                        type: "integer",
                        format: "int64",
                        minimum: 1,
                        description: "分类ID编号",
                    },
                    name: {
                        type: "string",
                        description: "分类名称",
                    },
                },
                xml: {
                    name: "Category",
                },
            },
            Tag: {
                type: "object",
                properties: {
                    id: {
                        type: "integer",
                        format: "int64",
                    },
                    name: {
                        type: "string",
                    },
                },
                xml: {
                    name: "Tag",
                },
            },
            ApiResponse: {
                type: "object",
                properties: {
                    code: {
                        type: "integer",
                        format: "int32",
                    },
                    type: {
                        type: "string",
                    },
                    message: {
                        type: "string",
                    },
                },
            },
            User: {
                type: "object",
                properties: {
                    id: {
                        type: "integer",
                        format: "int64",
                    },
                    username: {
                        type: "string",
                    },
                    firstName: {
                        type: "string",
                    },
                    lastName: {
                        type: "string",
                    },
                    email: {
                        type: "string",
                    },
                    password: {
                        type: "string",
                    },
                    phone: {
                        type: "string",
                    },
                    userStatus: {
                        type: "integer",
                        format: "int32",
                        description: "User Status",
                    },
                },
                xml: {
                    name: "User",
                },
            },
            Pet: {
                type: "object",
                required: ["name", "photoUrls"],
                properties: {
                    id: {
                        type: "integer",
                        format: "int64",
                    },
                    category: {
                        $ref: "#/components/schemas/Category",
                    },
                    name: {
                        type: "string",
                        example: "doggie",
                    },
                    photoUrls: {
                        type: "array",
                        xml: {
                            name: "photoUrl",
                            wrapped: true,
                        },
                        items: {
                            type: "string",
                        },
                    },
                    tags: {
                        type: "array",
                        xml: {
                            name: "tag",
                            wrapped: true,
                        },
                        items: {
                            $ref: "#/components/schemas/Tag",
                        },
                    },
                    status: {
                        type: "string",
                        description: "pet status in the store",
                        enum: ["available", "pending", "sold"],
                    },
                },
                xml: {
                    name: "Pet",
                },
            },
            CreateContestsCategory: {
                type: "object",
                description: "创建比赛类别",
                properties: {
                    name: {
                        type: "string",
                        description: "类别名称",
                    },
                },
            },
            UserArray: {
                type: "array",
                items: {
                    $ref: "#/components/schemas/User",
                },
            },
            Tag1: {
                type: "object",
                properties: {
                    id: {
                        type: "integer",
                        format: "int64",
                        minimum: 1,
                        description: "标签ID编号",
                    },
                    name: {
                        type: "string",
                        description: "标签名称",
                    },
                },
                xml: {
                    name: "Tag",
                },
            },
            Order: {
                type: "object",
                properties: {
                    id: {
                        type: "integer",
                        format: "int64",
                    },
                    petId: {
                        type: "integer",
                        format: "int64",
                    },
                    quantity: {
                        type: "integer",
                        format: "int32",
                    },
                    shipDate: {
                        type: "string",
                        format: "date-time",
                    },
                    status: {
                        type: "string",
                        description: "Order Status",
                        enum: ["placed", "approved", "delivered"],
                    },
                    complete: {
                        type: "boolean",
                        default: false,
                    },
                },
                xml: {
                    name: "Order",
                },
            },
            ContestsCategoryList: {
                allOf: [
                    {
                        type: "object",
                        properties: {},
                    },
                    {
                        type: "object",
                        properties: {
                            results: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {},
                                },
                            },
                        },
                    },
                ],
            },
            Pet1: {
                required: [
                    "name",
                    "photoUrls",
                    "id",
                    "category",
                    "tags",
                    "status",
                ],
                type: "object",
                properties: {
                    id: {
                        type: "integer",
                        format: "int64",
                        minimum: 1,
                        maximum: 5000,
                        description: "宠物ID编号",
                    },
                    category: {
                        $ref: "#/components/schemas/Category1",
                    },
                    name: {
                        type: "string",
                        example: "doggie",
                        description: "名称",
                    },
                    photoUrls: {
                        type: "array",
                        xml: {
                            name: "photoUrl",
                            wrapped: true,
                        },
                        items: {
                            type: "string",
                        },
                        description: "照片URL",
                    },
                    tags: {
                        type: "array",
                        xml: {
                            name: "tag",
                            wrapped: true,
                        },
                        items: {
                            $ref: "#/components/schemas/Tag1",
                        },
                        description: "标签",
                    },
                    status: {
                        type: "string",
                        description: "宠物销售状态",
                        enum: ["available", "pending", "sold"],
                    },
                },
                xml: {
                    name: "Pet",
                },
            },
        },
    },
};
