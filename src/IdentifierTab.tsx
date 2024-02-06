import { useVeramo } from '@veramo-community/veramo-react'
import { IResolver, } from '@veramo/core-types'
import { getEthereumAddress, } from '@veramo/utils'
import React, { useMemo } from 'react'
import { useQueries, useQuery } from 'react-query'
import { getHandles } from './api'
import { Card, List, Typography, } from 'antd'
import { ProfileFragment } from "@lens-protocol/client";

export const IdentifierTab: React.FC<{ did: string }> = ({  
  did,
}) => {

  const { agent } = useVeramo<IResolver>()


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
    <List
      grid={{       
        gutter: 16,
        xs: 1,
        sm: 1,
        md: 1,
        lg: 1,
        xl: 1,
        xxl: 1,
        column: 1,
      }}
      dataSource={handles}
      renderItem={(item) => (
        <Card style={{ margin: 10 }} title={`@${item.handle?.localName}`}>
          <Typography.Text>{item.metadata?.displayName}</Typography.Text>
          <Typography.Paragraph>{item.metadata?.bio}</Typography.Paragraph>
        </Card>
      )}
    />
  )
}


