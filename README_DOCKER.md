# gihan9a/staticmaps-service

## Running container
```bash
docker container run -d \
         -p 8080:8080 \
         --volume /path/to/my/cache/folder:/cache \
         gihan9a/staticmaps-service
```

## Environment variables

| Variable                   | Description                       | Default   |
| -------------------------- | --------------------------------- | --------- |
| PORT                       | Application port inside container | 8080      |
| IMAGE_FORMAT_DEFAULT       | Default output image format       | jpg       |
| IMAGE_HEIGHT_MAX           | Maximum output image height       | 1999      |
| IMAGE_HEIGHT_MIN           | Minium output image height        | 1         |
| IMAGE_WIDTH_MAX            | Maximum output image width        | 1999      |
| IMAGE_WIDTH_MIN            | Minimum output image width        | 1         |
| MARKER_COLOR_DEFAULT       | Default marker color              | orange    |
| PATH_COLOR_DEFAULT         | Default path color                | #000000BB |
| POLYGON_FILL_COLOR_DEFAULT | Default polygon fill color        | #00000088 |
| TEXT_COLOR                 | Default text (stroke) color       | #000000BB |
| TEXT_FILL_COLOR            | Default text fill color           | #000000BB |
| TEXT_FONT                  | Default font family               | Arial     |
| TEXT_SIZE                  | Default text size                 | 12        |
| TEXT_WIDTH                 | Default text stoke width          | 1         |
| ZOOM_MAX                   | Maximum zoom avaialble            | 20        |
| ZOOM_MIN                   | Minimum zoom avaialble            | 1         |

## Volumes

`/cache` directory can be mounted as a volume to persist image caches