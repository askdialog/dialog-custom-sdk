# Dialog SDK

## Dialog

Dialog is an AI assistant designed to boost e-commerce sales by providing intelligent product recommendations and seamless customer interactions.

Visit our website: [Dialog AI Assistant](https://www.askdialog.com/)

## Description

Dialog SDK is a powerful TypeScript library that seamlessly integrates the Dialog AI assistant into your applications. It provides a comprehensive set of tools for managing assistant interactions, handling e-commerce operations like product fetching and cart management, and customizing the assistant's appearance to match your brand.

## Get started

### Prerequisites

Before using the Dialog SDK, you need:

- An active API Key, you can retrieve your api key in your [organization settings](https://app.askdialog.com/settings)

### Installation

```bash
npm install @dialog/dialog-sdk
# or
pnpm add @dialog/dialog-sdk
# or
yarn add @dialog/dialog-sdk
```

You can also use our CDN link if you’re not using a package manager.

- Add the script to your project (replace X, Y, Z by versions)

```html
<script src="https://d2m6yt8rnm4dos.cloudfront.net/dialog-sdk.X.Y.Z.min.js"></script>
```
- The `DialogSDK` object will be available on the `window`. You can access all features as shown below:
```typescript

const client = new window.DialogSDK.Dialog({
    apiKey: 'YOUR_API_KEY',
    // ........
})
```

### Instantiate the client

```typescript
import { Dialog } from '@dialog/dialog-sdk';

const client = new Dialog({
  apiKey: 'YOUR_API_KEY', // required
  locale: 'TARGETED_LOCALE', // required
  callbacks: {
    addToCart: async ({
    productId,
    quantity,
    variantId,
  }: {
    productId: string;
    quantity: number;
    variantId?: string;
  }) => Promise<void>, // required
    getProduct: async (
        productId: string,
        variantId?: string
    ) => Promise<SimplifiedProduct>, // required
  },
});
```

The apiKey is required to authenticate with our API and interact with our assistant.
The locale specifies the language you want to use.
The addToCart function is triggered when a user clicks the AddToCart button.
The getProduct function is used to display product information in the assistant.

When the client is instantiated, it will automatically insert into the DOM the Dialog Assistant script, so you can interact with the assistant using `sendProductMessage` or `sendGenericMessage`.

### Getters

- apiKey
- theme
- userId
- locale

### Features

- Send a message with context

```typescript
 client.sendProductMessage({
    question: 'YOUR_QUESTION', // required
    productId: 'PRODUCT_ID', // required
    productTitle: 'PRODUCT_TITLE', // required
    answer: '', // Optional
    selectedVariantId?: 'CURRENT_VARIANT_ID', // Optional
 })
```

- Send message without context

```typescript
client.sendGenericMessage({
  question: 'YOUR_QUESTION', // required
});
```

- Get locale information

```typescript 
const localizationInfos = await client.getLocalizationInformations();

/*
Example of expected result when locale: 'en'
{
  countryCode: "US",
  formatted: "en-US",
  language: "English",
  locale: "en"
}
*/
```

- Get suggestion questions

You can use this query to make your own integration and trigger `sendProductMessage` or `sendGenericMessage` on user click.

```typescript
const suggestions = await client.getSuggestions(productId);

/*
Example of expected result:
{
    "questions": [
        {
            "question": "What is the formula used in this repairing gel to soothe the skin after sun exposure?"
        },
        {
            "question": "How does this gel relieve sunburn and reduce pain?"
        },
        {
            "question": "What are the benefits for the skin after using this product following excessive exposure to UV rays?"
        }
    ],
    "assistantName": "Your expert",
    "inputPlaceholder": "Ask any question...",
    "description": "Ask any question about this product"
}
*/
```


- Handler for fetch product

```typescript
const client = new Dialog({
    ...,
    callbacks: {
        getProduct: (
            productId: string,
            variantId?: string): Promise<SimplifiedProduct> => {
                // Call your api to retrieve product information
                const response = await fetch('....');
                const data = await response.json();
                // Need to match SimplifiedProduct type
                return {
                    ...
                };
        }
    },
});
```

- Handler for add to cart

```typescript
const client = new Dialog({
    ...,
    callbacks: {
        addToCart: ({
            productId,
            quantity,
            variantId,
        }: {
            productId: string;
            quantity: number;
            variantId?: string;
        }): Promise<void> => {
            // Call your api to trigger addToCart
            const response = await fetch('....');

            // Trigger other stuff like confirmation modal
            return;
        }
    },
});
```


### Theming (Still in construction)

We are currently working on the theming part so you may find some issues. Contact us if you need more customization.


⚠️ Title, description and content properties are used only to theme the Vue component for the moment.

```typescript
const client = new Dialog({
  ...,
  theme: {
    backgroundColor?: string;
    primaryColor?: string;
    ctaTextColor?: string;
    ctaBorderType?: 'straight' | 'rounded';
    capitalizeCtas?: boolean;
    fontFamily?: string;
    highlightProductName?: boolean;
    title?: { // Used in Vue component only
        fontSize?: string;
        color?: string;
    }
    description?: { // Used in Vue component only
        fontSize?: string;
        color?: string;
    }
    content?: { // Used in Vue component only
        fontSize?: string;
        color?: string;
    }
  }
});
```

### Tracking

Our SDK includes a tracking system to monitor user interactions in your purchase flow.

#### Automatic Tracking

When a user interacts with our assistant and clicks on an "Add to Cart" CTA, it automatically triggers the previously configured `addToCart` callback (see "Client Instantiation" section). These events are tracked internally by our system.

#### Manual Tracking

However, we cannot automatically detect cart additions or checkout completions that occur **after** using our assistant. To get accurate data in your Dialog dashboards, you should use the following tracking methods:

#### Available Methods

```typescript

client.registerAddToCartEvent({
    productId: 'ProductIdentifier', // {string} - Required
    quantity: 1, // {number} - Required
    variantId: 'VariantIdentifier' // {string} - Optional
});

client.registerSubmitCheckoutEvent({
    productId: 'ProductIdentifier', // {string} - Required
    quantity: 1, // {number} - Required
    variantId: 'VariantIdentifier' // {string} - Optional
});
```