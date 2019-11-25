import { scaleLinear } from "d3-scale";
import { AnimatePresence, motion } from "framer-motion";
import { FC, useContext, useMemo, useState } from "react";
import { useUpdateEffect } from "react-use";

import { Box, Flex, Stack, Text } from "@chakra-ui/core";
import { TrackingContext } from "@components/Tracking";
import {
  CURRENT_DISTRIBUTION_LABEL,
  StateCourse,
  termTypeToNumber,
} from "@constants";
import { ICourse, ITakenCourse } from "@interfaces";

import { ConfigContext } from "./Config";
import { CoursesFlowContext } from "./CoursesFlow";
import { Histogram } from "./Histogram";

export const passColorScale = scaleLinear<string, number>();

export const failColorScale = scaleLinear<string, number>();

export const CourseBox: FC<ICourse> = ({
  name,
  code,
  credits,
  flow,
  requisites,
  historicDistribution,
  taken,
}) => {
  const config = useContext(ConfigContext);
  const {
    MIN_GRADE,
    MAX_GRADE,
    REQ_CIRCLE_COLOR,
    REQ_CIRCLE_LABEL,
    REQUISITE_COURSE_BOX_COLOR,
    STATE_CANCELED_LABEL_MINI,
    STATE_COURSE_CANCELED_COLOR,
    STATE_COURSE_CIRCLE_STROKE,
    STATE_COURSE_CURRENT_COLOR,
    STATE_COURSE_PENDING_COLOR,
    STATE_CURRENT_LABEL_MINI,
    STATE_FAILED_LABEL_MINI,
    STATE_PASSED_LABEL_MINI,
    STATE_PENDING_LABEL_MINI,
    EXPLICIT_SEMESTER_COURSE_BOX_COLOR,
    FLOW_CIRCLE_COLOR,
    FLOW_CIRCLE_LABEL,
    FLOW_COURSE_BOX_COLOR,
    HISTORIC_GRADES,
    INACTIVE_COURSE_BOX_COLOR,
    ACTIVE_COURSE_BOX_COLOR,
    COURSE_BOX_BACKGROUND_COLOR,
    COURSE_BOX_TEXT_COLOR,
  } = config;

  const Tracking = useContext(TrackingContext);
  const { semestersTaken } = useMemo(() => {
    const semestersTaken = taken.map(({ term, year }) => {
      return { term, year };
    });

    return { semestersTaken };
  }, [taken]);

  const {
    add,
    remove,
    active,
    flow: contextFlow,
    requisites: contextRequisites,
    checkExplicitSemester,
    explicitSemester,
  } = useContext(CoursesFlowContext);

  const {
    state,
    grade,
    registration,
    currentDistribution,
    term,
    year,
  } = useMemo<Partial<ITakenCourse>>(() => {
    const foundSemesterTaken = checkExplicitSemester(semestersTaken);
    if (foundSemesterTaken) {
      const foundData = taken.find(({ term, year }) => {
        return (
          year === foundSemesterTaken.year && term === foundSemesterTaken.term
        );
      });
      return foundData || {};
    }
    return taken[0] || {};
  }, [semestersTaken, explicitSemester, checkExplicitSemester, taken]);

  const [open, setOpen] = useState(false);

  useUpdateEffect(() => {
    if (open) {
      add({
        course: code,
        flow,
        requisites,
        semestersTaken,
      });
    } else {
      remove(code);
    }
  }, [open]);

  const height = useMemo(() => {
    if (open) {
      if (taken[0]?.currentDistribution && historicDistribution) {
        return 350;
      } else {
        return 350 - 130;
      }
    }
    return 120;
  }, [open, taken, historicDistribution]);

  const stateColor = useMemo(() => {
    switch (state) {
      case StateCourse.Passed:
        return (passColorScale(grade || MAX_GRADE) as unknown) as string;
      case StateCourse.Failed:
        return (failColorScale(grade || MIN_GRADE) as unknown) as string;
      case StateCourse.Current:
        return STATE_COURSE_CURRENT_COLOR;
      case StateCourse.Canceled:
        return STATE_COURSE_CANCELED_COLOR;
      case StateCourse.Pending:
        return STATE_COURSE_PENDING_COLOR;
      default:
        return "transparent";
    }
  }, [state, grade, config]);

  const opacity = useMemo(() => {
    if (active) {
      if (active === code || contextFlow?.[code] || contextRequisites?.[code]) {
        return 1;
      }
    }

    if (explicitSemester) {
      if (checkExplicitSemester(semestersTaken)) {
        return 1;
      }
      return 0.5;
    }
    if (!active && !explicitSemester) {
      return 1;
    }
    return 0.5;
  }, [
    active,
    code,
    contextFlow,
    contextRequisites,
    explicitSemester,
    semestersTaken,
    checkExplicitSemester,
  ]);
  const borderColor = useMemo(() => {
    if (active === code) {
      return ACTIVE_COURSE_BOX_COLOR;
    }
    if (contextFlow?.[code]) {
      return FLOW_COURSE_BOX_COLOR;
    }
    if (contextRequisites?.[code]) {
      return REQUISITE_COURSE_BOX_COLOR;
    }
    if (checkExplicitSemester(semestersTaken)) {
      return EXPLICIT_SEMESTER_COURSE_BOX_COLOR;
    }
    return INACTIVE_COURSE_BOX_COLOR;
  }, [
    active,
    code,
    explicitSemester,
    checkExplicitSemester,
    semestersTaken,
    contextFlow,
    contextRequisites,
    config,
  ]);

  const NameComponent = useMemo(
    () => (
      <Stack spacing={1}>
        <Text>
          <b>{code}</b>
        </Text>
        <Text fontSize={9} maxWidth="150px">
          {name}
        </Text>
      </Stack>
    ),
    [code, name]
  );

  const RegistrationComponent = useMemo(
    () =>
      registration &&
      open && (
        <motion.div
          key="status"
          initial={{
            opacity: 0,
          }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
          }}
          className="registration_box"
        >
          <Text fontSize="9px">
            <b>{registration}</b>
          </Text>
        </motion.div>
      ),
    [open, registration]
  );

  const CreditsComponent = useMemo(
    () =>
      !open && (
        <motion.div
          key="sct"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="credits_box"
        >
          {credits.map(({ label, value }, key) => {
            return (
              <Text fontSize="9px" key={key}>
                <b>{`${label}: ${value}`}</b>
              </Text>
            );
          })}
        </motion.div>
      ),
    [open, credits]
  );

  const ReqCircleComponent = useMemo(
    () =>
      (contextFlow?.[code] || contextRequisites?.[code]) && (
        <motion.div
          key="req_circle"
          initial={{
            opacity: 0,
          }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
          }}
          className="req_circle_box"
        >
          <Box mt="-10px">
            <svg width={32} height={32}>
              <circle
                r={15}
                cx={16}
                cy={16}
                stroke={
                  contextFlow?.[code] ? FLOW_CIRCLE_COLOR : REQ_CIRCLE_COLOR
                }
                fill="transparent"
              />
              <text
                x={4}
                y={21}
                fontWeight="bold"
                fill={
                  contextFlow?.[code] ? FLOW_CIRCLE_COLOR : REQ_CIRCLE_COLOR
                }
              >
                {contextFlow?.[code] ? FLOW_CIRCLE_LABEL : REQ_CIRCLE_LABEL}
              </text>
            </svg>
          </Box>
        </motion.div>
      ),
    [contextFlow, contextRequisites, code, config]
  );

  const HistogramNow = useMemo(
    () =>
      currentDistribution &&
      term &&
      year && (
        <Histogram
          key="now"
          label={CURRENT_DISTRIBUTION_LABEL({
            term: termTypeToNumber(term),
            year,
          })}
          distribution={currentDistribution}
          grade={grade}
        />
      ),
    [currentDistribution, term, year, grade]
  );

  const HistogramHistoric = useMemo(
    () =>
      historicDistribution && (
        <Histogram
          key="historic"
          label={HISTORIC_GRADES}
          distribution={historicDistribution}
          grade={grade}
        />
      ),
    [historicDistribution, grade, config]
  );

  const HistogramsComponent = useMemo(
    () =>
      open && (
        <motion.div
          key="histograms"
          initial={{
            opacity: 0,
            scale: 0,
          }}
          animate={{
            scale: 1,
            opacity: 1,
          }}
          exit={{
            opacity: 0,
            scale: 0.4,
          }}
          className="histogram_box"
        >
          {HistogramNow}

          {HistogramHistoric}
        </motion.div>
      ),
    [open, HistogramNow, HistogramHistoric]
  );

  const GradeComponent = useMemo(() => {
    return (
      grade !== undefined && (
        <Text mb={2} pt={1}>
          <b>
            {(() => {
              if (grade) {
                return grade.toFixed(1);
              }
              switch (state) {
                case StateCourse.Passed:
                  return STATE_PASSED_LABEL_MINI;
                case StateCourse.Failed:
                  return STATE_FAILED_LABEL_MINI;
                case StateCourse.Canceled:
                  return STATE_CANCELED_LABEL_MINI;
                case StateCourse.Pending:
                  return STATE_PENDING_LABEL_MINI;
                case StateCourse.Current:
                  return STATE_CURRENT_LABEL_MINI;
                default:
                  return "BUG";
              }
            })()}
          </b>
        </Text>
      )
    );
  }, [grade, state, config]);

  const HistoricalCirclesComponent = useMemo(
    () =>
      taken.length > 1 && (
        <Stack spacing={0.7}>
          {taken.slice(1).map(({ state, grade }, key) => {
            let color: string;
            switch (state) {
              case StateCourse.Failed:
                color = (failColorScale(grade || 0) as unknown) as string;
                break;
              case StateCourse.Current:
                color = STATE_COURSE_CURRENT_COLOR;
                break;
              case StateCourse.Canceled:
                color = STATE_COURSE_CANCELED_COLOR;
                break;
              case StateCourse.Pending:
                color = STATE_COURSE_PENDING_COLOR;
                break;
              default:
                color = "black";
            }
            return (
              <Box
                key={key}
                m={0}
                p={0}
                paddingBottom="0px"
                color={color}
                height={"16px"}
                width={"16px"}
              >
                <svg width={16} height={16}>
                  <circle
                    cx={8}
                    cy={8}
                    r="6"
                    stroke={STATE_COURSE_CIRCLE_STROKE}
                    fill={color}
                  />
                </svg>
              </Box>
            );
          })}
        </Stack>
      ),
    [taken, config]
  );

  return (
    <Flex
      m={1}
      color={COURSE_BOX_TEXT_COLOR}
      bg={COURSE_BOX_BACKGROUND_COLOR}
      width={open ? 350 : 180}
      height={height}
      borderRadius={5}
      opacity={opacity}
      border="2px"
      borderColor={borderColor}
      borderWidth={active === code ? "3.5px" : "2px"}
      cursor="pointer"
      transition="0.4s all ease-in-out"
      onClick={() => {
        setOpen(open => !open);

        Tracking.current.track({
          action: "click",
          target: `course-box-${code}`,
          effect: `${open ? "close" : "open"}-course-box`,
        });
      }}
      className="unselectable"
    >
      <Flex w="100%" h="100%" pt={2} pl={2} pos="relative">
        {NameComponent}

        <AnimatePresence>
          {RegistrationComponent}
          {CreditsComponent}

          {ReqCircleComponent}

          {HistogramsComponent}
        </AnimatePresence>
      </Flex>
      <Flex
        mr={"-0.5px"}
        w="40px"
        mt="-0.4px"
        h="100.5%"
        bg={stateColor}
        direction="column"
        alignItems="center"
        borderRadius="0px 3px 3px 0px"
        zIndex={0}
        transition="0.4s all ease-in-out"
        border="1px solid"
        borderColor={borderColor}
      >
        {GradeComponent}

        {HistoricalCirclesComponent}
      </Flex>
    </Flex>
  );
};
