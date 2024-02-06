/* eslint-disable */

import React, { useMemo } from 'react';
import { IIdentifierHoverComponentProps } from "@veramo-community/agent-explorer-plugin";
import { IDataStoreORM, UniqueVerifiableCredential } from '@veramo/core-types';
import { useVeramo } from '@veramo-community/veramo-react';
import { useQueries, useQuery } from 'react-query';
import { Spin, Typography } from 'antd';
import { getEthereumAddress, computeEntryHash } from '@veramo/utils'
import { Icon } from './Icon';
import { getHandles } from './api';
import { ProfileFragment } from "@lens-protocol/client";

export const IdentifierHoverComponent: React.FC<IIdentifierHoverComponentProps> = ({did}) => {
  const { agent } = useVeramo<IDataStoreORM>()

  const { data: resolutionResult, isLoading } = useQuery(
    ['identifier', did],
    () => agent?.resolveDid({ didUrl: did }),
  )

  const addresses: string[] = useMemo(() => {
    const addresses: string[] = []
    if (resolutionResult?.didDocument?.verificationMethod) {
      for (const vm of resolutionResult.didDocument.verificationMethod) {
        const address = getEthereumAddress(vm)
        if (address) {
          addresses.push(address)
        }
      }
    }
    return addresses
  }, [resolutionResult])

  const handleQueries = useQueries(
    addresses.map(address => {
      return {
        queryKey: ['lens-handles', address],
        queryFn: () => getHandles(address),
      }
    })
  )

  const handles: ProfileFragment[] = React.useMemo(() => {
    const handles: ProfileFragment[] = []
    for (const handlesQuery of handleQueries) {
      if (handlesQuery.isSuccess && handlesQuery.data) {
        handlesQuery.data.forEach((handle) => {
          handles.push(handle)
        })
      }
    }
    return handles
  }, [handleQueries])



  return (
    <Typography.Text>
      <Icon small/> {isLoading ? <Spin /> : handles.map((h,i) => <span key={i}>@{h.handle?.localName}</span>)}
    </Typography.Text>
  )
}


