CREATE TABLE image (
    id          UUID        NOT NULL DEFAULT gen_random_uuid (),
    filename    VARCHAR     NOT NULL,
    path        VARCHAR     NOT NULL,
    created_at  TIMESTAMP   NOT NULL,

    PRIMARY KEY (id)
);