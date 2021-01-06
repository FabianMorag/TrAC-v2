import { AnimatePresence, motion } from "framer-motion";
import React, { FC, memo, useContext, useEffect, useState } from "react";

import { Flex, Stack, Text } from "@chakra-ui/react";

import { ConfigContext } from "../../context/Config";
import { setTrackingData, track } from "../../context/Tracking";

export const Employed: FC<{
  educational_system?: string | null;
  institution?: string | null;
  months_to_first_job?: number | null;
}> = memo(({ educational_system, institution, months_to_first_job }) => {
  const {
    EMPLOYED_BACKGROUND_COLOR,
    EMPLOYED_INFORMATION,
    EMPLOYED_EDUCATIONAL_SYSTEM,
    EMPLOYED_INSTITUTION,
    EMPLOYED_MONTHS,
    EMPLOYED_TEXT_COLOR,
  } = useContext(ConfigContext);

  const [show, setShow] = useState(false);

  useEffect(() => {
    setTrackingData({
      showingPrediction: show,
    });
  }, [show]);

  if (institution == null) return null;

  return (
    <Flex alignItems="center" ml="1em">
      <Flex
        backgroundColor={EMPLOYED_BACKGROUND_COLOR}
        boxShadow={
          show
            ? "0px 0px 2px 1px rgb(174,174,174)"
            : "2px 3px 2px 1px rgb(174,174,174)"
        }
        borderRadius={show ? "5px 5px 5px 5px" : "0px 5px 5px 0px"}
        alignItems="center"
        onClick={() => {
          setShow((show) => !show);

          track({
            action: "click",
            effect: show ? "close-employed" : "open-employed",
            target: "employed",
          });
        }}
        color={EMPLOYED_TEXT_COLOR}
        cursor="pointer"
        transition="box-shadow 0.4s ease-in-out"
      >
        <Stack className="unselectable" isInline pt={10} pb={10}>
          <Text
            minWidth="55px"
            height="120px"
            m={0}
            ml={4}
            textAlign="center"
            fontWeight="bold"
            fontFamily="Lato"
            className="verticalText"
            fontSize="1.2em"
          >
            {EMPLOYED_INFORMATION}
          </Text>
          <AnimatePresence>
            {show && (
              <motion.div
                key="employed-text"
                initial={{
                  opacity: 0,
                }}
                animate={{ opacity: 1 }}
                exit={{
                  opacity: 0,
                }}
              >
                <Text
                  width="290px"
                  pl={5}
                  pb={0}
                  mb={0}
                  fontWeight="bold"
                  fontFamily="Lato"
                >
                  {EMPLOYED_EDUCATIONAL_SYSTEM}
                </Text>
                <Text fontSize="1.2em" ml={5} mb={2} fontFamily="Lato">
                  {educational_system}
                </Text>
                <Text
                  width="290px"
                  pl={5}
                  pb={0}
                  mb={0}
                  fontWeight="bold"
                  fontFamily="Lato"
                >
                  {EMPLOYED_INSTITUTION}
                </Text>
                <Text fontSize="1.2em" ml={5} mb={2} fontFamily="Lato">
                  {institution}
                </Text>
                <Text
                  width="290px"
                  pl={5}
                  pb={0}
                  mb={0}
                  fontWeight="bold"
                  fontFamily="Lato"
                >
                  {EMPLOYED_MONTHS}
                </Text>
                <Text fontSize="1.2em" ml={5} mb={2} fontFamily="Lato">
                  {months_to_first_job}
                </Text>
              </motion.div>
            )}
          </AnimatePresence>
        </Stack>
      </Flex>
    </Flex>
  );
});

export default Employed;
