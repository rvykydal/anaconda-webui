/*
 * Copyright (C) 2022 Red Hat, Inc.
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation; either version 2.1 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with This program; If not, see <http://www.gnu.org/licenses/>.
 */
import cockpit from "cockpit";

import { usePageLocation } from "hooks";

import React, { useContext, useState } from "react";
import {
    PageSection,
    PageSectionTypes,
    PageSectionVariants,
    Wizard,
    WizardStep,
} from "@patternfly/react-core";

import { AnacondaPage } from "./AnacondaPage.jsx";
import { AnacondaWizardFooter } from "./AnacondaWizardFooter.jsx";
import { FooterContext, StorageContext, SystemTypeContext } from "../contexts/Common.jsx";
import { getSteps } from "./steps.js";

export const AnacondaWizard = ({ currentStepId, dispatch, isFetching, onCritFail, showStorage }) => {
    // The Form should be disabled while backend checks are in progress
    // or the page initialization is in progress
    const [isFormDisabled, setIsFormDisabled] = useState(false);
    // The Form should be marked as invalid when the user filled data
    // are failing the validation
    const [isFormValid, setIsFormValid] = useState(false);
    const { storageScenarioId } = useContext(StorageContext);
    const isBootIso = useContext(SystemTypeContext) === "BOOT_ISO";
    const { path } = usePageLocation();

    const componentProps = {
        dispatch,
        isFormDisabled: isFormDisabled || isFetching,
        onCritFail,
        setIsFormDisabled,
        setIsFormValid,
        showStorage,
    };

    const stepsOrder = getSteps(isBootIso, storageScenarioId);
    const firstStepId = stepsOrder.filter(s => !s.isHidden)[0].id;

    const createSteps = (stepsOrder, componentProps) => {
        return stepsOrder.map(s => {
            const isVisited = firstStepId === s.id || currentStepId === s.id;
            let stepProps = {
                id: s.id,
                isDisabled: isFormDisabled || isFetching,
                isHidden: s.isHidden || s.isFinal,
                isVisited,
                name: s.label,
                stepNavItemProps: { id: s.id },
                ...(s.steps?.length && { isExpandable: true }),
            };
            if (s.component) {
                stepProps = {
                    children: (
                        <AnacondaPage
                          isFormDisabled={isFormDisabled}
                          setIsFormDisabled={setIsFormDisabled}
                          step={s.id}
                          title={s.title}
                          usePageInit={s.usePageInit}>
                            <s.component {...componentProps} />
                        </AnacondaPage>
                    ),
                    ...stepProps
                };
            } else if (s.steps) {
                const subSteps = createSteps(s.steps, componentProps);
                stepProps = {
                    ...stepProps,
                    steps: [...subSteps]
                };
            }
            return (
                <WizardStep key={s.id + s.isVisited + (stepProps.isDisabled ? "-disabled" : "-not-disabled")} {...stepProps} />
            );
        });
    };
    const steps = createSteps(stepsOrder, componentProps);

    const goToStep = (newStep, prevStep) => {
        if (prevStep.id !== newStep.id) {
            // first reset validation state to default
            setIsFormValid(false);
            // and disable the form so that the page can perform
            //  initialization before the user can interact with it
            setIsFormDisabled(true);
        }

        cockpit.location.go([newStep.id]);
    };

    const finalStep = stepsOrder[stepsOrder.length - 1];
    if (path[0] === finalStep.id) {
        return (
            <PageSection variant={PageSectionVariants.light}>
                <finalStep.component {...componentProps} />
            </PageSection>
        );
    }

    const startIndex = steps.findIndex(step => {
        // Find the first step that is not hidden if the Wizard is opening for the first time.
        // Otherwise, find the first step that was last visited.
        return currentStepId ? step.props.id === currentStepId : !step.props.isHidden;
    }) + 1;

    // Properties from usePage to be passed to the Wizard Footer,
    // in case the Page is not using custom footer.
    const stepProps = stepsOrder[startIndex - 1];
    const footerProps = {
        footerHelperText: stepProps?.footerHelperText,
        nextButtonText: stepProps?.nextButtonText,
        nextButtonVariant: stepProps?.nextButtonVariant,
    };

    return (
        <PageSection type={PageSectionTypes.wizard} variant={PageSectionVariants.light}>
            <FooterContext.Provider value={{
                isFormDisabled: isFormDisabled || isFetching,
                isFormValid,
                setIsFormDisabled,
                setIsFormValid,
            }}>
                <Wizard
                  id="installation-wizard"
                  isVisitRequired
                  startIndex={startIndex}
                  footer={<AnacondaWizardFooter {...footerProps} />}
                  onStepChange={((event, currentStep, prevStep) => goToStep(currentStep, prevStep))}
                >
                    {steps}
                </Wizard>
            </FooterContext.Provider>
        </PageSection>
    );
};
