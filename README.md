[![Build](https://github.com/anser-tv/anser-controller/workflows/Node%20CI/badge.svg)](https://github.com/anser-tv/anser-controller/actions)

# Anser Video Pipeline Management Tool

Anser is a tool for managing the creation, routing and distribution of video streams.

# Configuration

## Controller

Place this in the file `config/config.json` in the same folder as the controller (if running directly from the repository, in `anser/controller`)

```JS
{
    /** Authorized pre-shared keys for workers **/
    authKeys: [], // e.g. ['Hello', '1234']
    /* Optional, default is functions */
    functionsDirectory: "functions"
}
```

## Worker

Place this in the file `config/config.json` in the same folder as the worker (if running directly from the repository, in `anser/worker`)

```JS
{
    /** Every worker must have a unique ID **/
    id: "MY_WORKER_ID",
    /** URL of controller **/
    controller: "https://xxxxxxxxxx",
    authKey: "" /** e.g. "Hello" **/,
    /* Optional, default is functions */
    functionsDirectory: "functions"
}
```
