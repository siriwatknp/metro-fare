import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/styles";
import { Grid, IconButton, Paper, Typography } from "@material-ui/core";
import { useTripContext } from "../../contexts/TripProvider";
import { Journey, METRO_STATION_ID } from "../../types";
import { useDrawerContext } from "../../contexts/DrawerProvider";
import { FromToSelectDrawer } from "./FromToSelectDrawer";
import { useTranslation } from "react-i18next";
import { FromToSelect } from "./FromToSelect";
import NavigationService from "../../services/navigation.service";
import RouteInfoCard from "../RouteInfoCard";
import CloseIcon from "@material-ui/icons/Close";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";

const useStyles = makeStyles(() => ({
  container: {
    bottom: "0px",
    position: "absolute",
    zIndex: 1001,
    width: "100%",
  },
  containerWithJourneys: {
    bottom: "0px",
    position: "absolute",
    zIndex: 1001,
    width: "100%",
  },
  height50px: {
    height: "50px",
  },
  journeyHeader: {
    paddingLeft: "12px",
  },
  black: {
    color: "black",
  },
  paddingLeft0: {
    paddingLeft: "0px",
  },
  paddingRight0: {
    paddingRight: "0px",
  },
}));

export type DrawerType = "from" | "to" | null;

export const FromToSelectPanel = () => {
  const classes = useStyles();
  const { t: translation } = useTranslation();
  const { showRouteSearchDrawer, setRouteSearchDrawer } = useDrawerContext();
  const { trip, journey, setTrip, setJourney, resetJourney } = useTripContext();
  const [drawerType, setDrawerType] = useState<DrawerType>(null);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [journeyIndex, setJourneyIndex] = useState<number>(-1);

  const handleSetJourneyByIndex = (index: number) => {
    setJourneyIndex(index);
    setJourney(journeys[index]);
  };

  useEffect(() => {
    if (trip.source && trip.destination) {
      let journeys = NavigationService.findAllRoutesWithFare(
        trip.source,
        trip.destination
      );
      // sorted and get top 3
      journeys = journeys.sort((a, b) => a.fare - b.fare);
      journeys = journeys.slice(0, 3);
      setJourneys(journeys);
      setJourney(journeys[0]);
      setJourneyIndex(0);
    } else if (journey.route.length !== 0) {
      setJourneys([]);
      resetJourney();
      setJourneyIndex(-1);
    }
  }, [trip]);

  // consider move above useeffect to another component in FromToSelectPanel
  // when click route, show it in the map
  // when user click show detail or pull up, show detail

  // to learn - how to slide to move [] right to left as yandex app

  const handleDrawerClose = () => {
    setDrawerType(null);
    setRouteSearchDrawer(false);
  };

  const onSelectStation = (station: METRO_STATION_ID) => {
    if (drawerType === "from") {
      setTrip(station, trip.destination);
    } else {
      setTrip(trip.source, station);
    }
    handleDrawerClose();
  };

  return (
    <Paper
      classes={{
        root:
          journeyIndex !== -1
            ? classes.containerWithJourneys
            : classes.container,
      }}
    >
      <Grid container direction="column">
        {journeyIndex !== -1 && (
          <>
            <Grid
              container
              justify="space-between"
              alignItems="center"
              className={classes.journeyHeader}
            >
              <Typography variant="h6">
                {`${translation("route.route")} ${
                  journeyIndex + 1
                } ${translation("route.of")} ${journeys.length}`}
              </Typography>
              <IconButton
                className={classes.black}
                onClick={() => setTrip(trip.source, "" as METRO_STATION_ID)}
              >
                <CloseIcon />
              </IconButton>
            </Grid>
            <Grid container alignItems="center">
              <Grid xs={1} container justify="center" alignItems="center">
                {journeyIndex !== 0 && (
                  <IconButton
                    className={`${classes.black} ${classes.paddingRight0}`}
                    onClick={() => handleSetJourneyByIndex(journeyIndex - 1)}
                  >
                    <ChevronLeftIcon />
                  </IconButton>
                )}
              </Grid>
              <Grid xs={10} container justify="center" alignItems="center">
                <RouteInfoCard
                  journey={journey}
                  title={""}
                  onClick={() => {}}
                />
              </Grid>
              <Grid xs={1} container justify="center" alignItems="center">
                {journeyIndex < journeys.length - 1 && (
                  <IconButton
                    className={`${classes.black} ${classes.paddingLeft0}`}
                    onClick={() => handleSetJourneyByIndex(journeyIndex + 1)}
                  >
                    <ChevronRightIcon />
                  </IconButton>
                )}
              </Grid>
            </Grid>
          </>
        )}
        <Grid className={classes.height50px}>
          <FromToSelect setDrawerType={setDrawerType} />
        </Grid>
      </Grid>
      {drawerType && (
        <FromToSelectDrawer
          showRouteSearchDrawer={showRouteSearchDrawer}
          onClose={handleDrawerClose}
          stationId={drawerType === "from" ? trip.source : trip.destination}
          onSelect={onSelectStation}
          placeHolder={
            drawerType === "from"
              ? translation("route.from")
              : translation("route.to")
          }
        />
      )}
    </Paper>
  );
};
