import * as React from 'react';
import { calcProteinChangeSortValue } from 'cbioportal-utils';
import { Mutation } from 'cbioportal-ts-api-client';
import { TruncatedText } from 'cbioportal-frontend-commons';
import MutationStatusColumnFormatter from './MutationStatusColumnFormatter';
import styles from './proteinChange.module.scss';
import { ILazyMobXTableApplicationDataStore } from 'shared/lib/ILazyMobXTableApplicationDataStore';

export default class ProteinChangeColumnFormatter {
    public static getSortValue(d: Mutation[]): number | null {
        return calcProteinChangeSortValue(
            ProteinChangeColumnFormatter.getTextValue(d)
        );
    }

    public static getTextValue(data: Mutation[]): string {
        let textValue: string = '';
        const dataValue = ProteinChangeColumnFormatter.getData(data);

        if (dataValue) {
            textValue = dataValue.toString();
        }

        return textValue;
    }

    public static getFilterValue(
        data: Mutation[],
        filterString: string,
        filterStringUpper: string
    ): boolean {
        let filterValue = ProteinChangeColumnFormatter.getDisplayValue(data);
        const mutationStatus:
            | string
            | null = MutationStatusColumnFormatter.getData(data);

        if (
            mutationStatus &&
            mutationStatus.toLowerCase().includes('germline')
        ) {
            filterValue = `${filterValue}${mutationStatus}`;
        }

        return filterValue.toUpperCase().indexOf(filterStringUpper) > -1;
    }

    public static getDisplayValue(data: Mutation[]): string {
        // same as text value
        return ProteinChangeColumnFormatter.getTextValue(data);
    }

    public static getData(data: Mutation[]) {
        if (data.length > 0) {
            return data[0].proteinChange;
        } else {
            return null;
        }
    }

    public static doesMutationHaveSibling(
        data: Mutation[],
        dataStore?: ILazyMobXTableApplicationDataStore<Mutation[]>
    ): boolean {
        if (dataStore) {
            const sampleId = data[0].sampleId;
            const proteinChange = data[0].proteinChange;
            const hasSibling = dataStore.tableData.some(
                datum =>
                    datum[0].sampleId === sampleId &&
                    datum[0].proteinChange !== proteinChange
            );
            return hasSibling;
        }
        return false;
    }

    public static renderWithMutationStatus(
        dataStore?: ILazyMobXTableApplicationDataStore<Mutation[]>
    ) {
        return (data: Mutation[]) => {
            const hasSibling = ProteinChangeColumnFormatter.doesMutationHaveSibling(
                data,
                dataStore
            );

            // use text as display value
            const text: string = ProteinChangeColumnFormatter.getDisplayValue(
                data
            );

            const mutationStatus:
                | string
                | null = MutationStatusColumnFormatter.getData(data);

            let content = (
                <TruncatedText
                    text={text}
                    tooltip={<span>{text}</span>}
                    className={styles.proteinChange}
                    maxLength={40}
                />
            );

            // add a germline indicator next to protein change if it is a germline mutation!
            if (
                mutationStatus &&
                mutationStatus.toLowerCase().indexOf('germline') > -1
            ) {
                content = (
                    <span>
                        {content}
                        <span className={styles.germline}>Germline</span>
                    </span>
                );
            }

            if (hasSibling) {
                content = (
                    <span>
                        {content}
                        <TruncatedText
                            text={'multiple'}
                            tooltip={
                                <span>This sample has multiple mutations.</span>
                            }
                            addTooltip="always"
                            className={styles.multiple}
                        />
                    </span>
                );
            }

            return content;
        };
    }
}
