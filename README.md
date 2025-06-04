# @stephenhebert/axios-plugins

A collection of Axios plugins for enhanced functionality.

## Features

- **Allow 404 Responses**: Handle 404 responses gracefully without throwing errors.
- **Inflight Cache**: Prevent duplicate requests by caching inflight requests.
- **Get All Pages**: Automatically fetch paginated API results.

## Installation

Install the package via npm:

```bash
npm install @stephenhebert/axios-plugins
```

## Usage

### Allow 404 Responses

Enable the `allow404` plugin to handle 404 responses gracefully:

```ts
import axios from 'axios'
import { allow404 } from '@stephenhebert/axios-plugins'

const client = axios.create({
  plugins: {
    allow404: true,
  },
})

allow404.install(client)

client.get('http://example.com/api/data')
  .then(response => console.log(response.status)) // 404
  .catch(error => console.error(error))
```

### Inflight Cache

Prevent duplicate requests by enabling the `inflightCache` plugin:

```ts
import axios from 'axios'
import { inflightCache } from '@stephenhebert/axios-plugins'

const client = axios.create({
  plugins: {
    inflightCache: true,
  },
})

inflightCache.install(client)

client.get('http://example.com/api/data')
  .then(response => console.log(response.data))
```

### Get All Pages

Automatically fetch all paginated results:

```ts
import axios from 'axios'
import { getAllPages } from '@stephenhebert/axios-plugins'

const client = axios.create({
  plugins: {
    getAllPages: true,
  },
})

getAllPages.install(client)

client.get('http://example.com/api/data')
  .then(response => console.log(response.data))
```

## Development

### Build

Run the following command to build the project:

```bash
npm run build
```

### Test

Run the tests using Vitest:

```bash
npm run test
```

### Lint

Lint the codebase using ESLint:

```bash
npm run lint
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on [GitHub](https://github.com/stephenhebert/axios-plugins).

## Keywords

- axios
- plugins
- middleware
- interceptors
- http
- typescript
- javascript
- api