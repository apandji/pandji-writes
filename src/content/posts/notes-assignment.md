---
title: class 2
pubDate: 2026-08-27
journal: spatial-ai-apps
draft: true
---

# pre

**Assignment 1 **

- An interactive map exploring some spatial issues as a rich 2D map
- May be geospatial, or more abstract relationship
- Can be map analysis (YOLO), generated imagery or some other bespoke process
- App must employ some ML/AI elements which may be prealculated or realtime content
- App must be interactive - users can browse information, change views, or transform the underlying map

---

# lecture

## What is Geospatial Information?
Geospatial data identifies or describes locations, dimensions, borders, geometry and metadata related to physical environment, whether natural, artificial or conceptual.
- geography
- climate 
- land features 
- political boundaries


## What types Geospatial Data exist
- lat/long - label, a latitude or a longitude ... but it can have a bunch of additional information (elevation, pop, etc.)
- [GeoJSON](https://geojson.io) : features, polygons, properties contains all metadata
- OSM (OpenStreetMap) - has same kind of data as GeoJSON, but in XML ; user-generated so not the best
- GeoTIFF - this one is raster (or image-based) information 
- ShapeFile (SHP) - kinda like geojson, but for very specific kind of sites - what would be opened in ARCGIS or QGIS, not as open

## Use Cases
- Building Segmentation : Take an image, and identify all the building outlines
- Land Cover Identification : identify cropland, industrial, city, etc. (ESRI Land Cover Explorer) 

## Example Project
- Hired by Office for Urbanization at Harvard to help with the classification of historical Chinese regional types to create a census - inventory, range, etc. 
- 16 different building types, can there be AI / machine vision processes to do that 
- Human process of labeling a subset of the map, you then take the images and the labels to then train this model
- Then the model will take over and do it for the rest of the map
- Labeling - [labelstudio](labelstud.io)
- One model identified the building, and another generated the interior floor plan
- Self organizing map - that goes through a process of clustering

### Process
- UNET for Classification : Sattlete images -> labeling -> Training
- Pix2Pix to generate the plan and then clustering

## Geospatial Data Sources
- LandSAT (US) - open - [nasa world view](https://worldview.earthdata.nasa.gov)
- Sentinel (EU).- open
- Kartaview - not plan-based, but street-level
- tabular metadata, which may have geospatial - [data.gov](data.gov) 
- USGS, the national map - [apps.nationalmap.gov](https://apps.nationalmap.gov/downloader/)

---

# liner

- QGIS - open source version of ARCGIS
- geo-reference is the idea of taking some coordinates and then overlaying it to put on some map
- topography everything above sea level, topobathy everything below
