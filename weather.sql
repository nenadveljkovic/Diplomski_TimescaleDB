DROP TABLE IF EXISTS "devices";
CREATE TABLE "devices"(
    device_id    TEXT,
    location     TEXT,
    environment  TEXT,
	latitude DOUBLE PRECISION,
	longitude DOUBLE PRECISION,
	PRIMARY KEY (device_id)
);

DROP TABLE IF EXISTS "conditions";
CREATE TABLE "conditions"(
    time         TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    temperature  NUMERIC,
    humidity     NUMERIC,
	wind_speed	 NUMERIC,
	uv_index	 NUMERIC,
	device_id    TEXT NOT NULL,
	PRIMARY KEY (time, device_id)
);

CREATE INDEX ON "conditions"(time DESC);
CREATE INDEX ON "conditions"(device_id, time DESC);
-- 86400000000 is in usecs and is equal to 1 day
SELECT create_hypertable('conditions', 'time', chunk_time_interval => 86400000000);
