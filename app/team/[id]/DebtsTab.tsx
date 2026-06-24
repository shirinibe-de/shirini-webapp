'use client'

import { useEffect, useState } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { getDebts, createSettlement } from '@/lib/api/debts'
import type { Debt } from '@/lib/api/types'

interface DebtsTabProps {
  teamId: string
  currency: string
}

export function DebtsTab({ teamId, currency }: DebtsTabProps) {
  const [debts, setDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [settlingId, setSettlingId] = useState<string | null>(null)
  const [confirmSettleId, setConfirmSettleId] = useState<string | null>(null)
  const [settling, setSettling] = useState(false)

  useEffect(() => {
    loadDebts()
  }, [teamId])

  async function loadDebts() {
    try {
      setLoading(true)
      setError(null)
      const data = await getDebts(teamId)
      setDebts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load debts')
    } finally {
      setLoading(false)
    }
  }

  async function handleSettle(debtorId: string, amount: number) {
    try {
      setSettling(true)
      setError(null)
      await createSettlement(teamId, { debtor_id: debtorId })
      setDebts(debts.map(d => d.user.id === debtorId ? { ...d, total_debt: 0 } : d))
      setConfirmSettleId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to settle debt')
    } finally {
      setSettling(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-600">Loading debts...</div>
  }

  const debtors = debts.filter(d => d.total_debt > 0)
  const settled = debts.filter(d => d.total_debt === 0)

  return (
    <div>
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {debts.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          <p className="mb-2">No team members found</p>
        </div>
      ) : (
        <>
          {debtors.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Outstanding Debts</h3>
              <div className="space-y-3">
                {debtors.map(debt => (
                  <div
                    key={debt.user.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <Avatar name={debt.user.name} avatar_url={debt.user.avatar_url} />
                      <div>
                        <p className="font-semibold text-gray-900">{debt.user.name}</p>
                        <p className="text-sm text-gray-600">{debt.user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-600">{debt.total_debt}</p>
                      <p className="text-sm text-gray-600">{currency}</p>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setConfirmSettleId(debt.user.id)}
                        className="mt-2"
                      >
                        Settle
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {settled.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-600">All Settled</h3>
              <div className="space-y-3">
                {settled.map(debt => (
                  <div
                    key={debt.user.id}
                    className="flex items-center gap-4 p-4 bg-gray-100 rounded-lg opacity-60"
                  >
                    <Avatar name={debt.user.name} avatar_url={debt.user.avatar_url} />
                    <div>
                      <p className="font-semibold text-gray-700">{debt.user.name}</p>
                      <p className="text-sm text-gray-600">{debt.user.email}</p>
                    </div>
                    <div className="ml-auto text-center">
                      <p className="text-sm text-gray-600">No debt</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <Modal
        isOpen={!!confirmSettleId}
        onClose={() => setConfirmSettleId(null)}
        title="Confirm Settlement"
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setConfirmSettleId(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                const debt = debts.find(d => d.user.id === confirmSettleId)
                if (debt && confirmSettleId) {
                  handleSettle(confirmSettleId, debt.total_debt)
                }
              }}
              loading={settling}
            >
              Settle
            </Button>
          </div>
        }
      >
        {(() => {
          const debt = debts.find(d => d.user.id === confirmSettleId)
          return debt ? (
            <p>
              Mark <strong>{debt.user.name}</strong>'s debt of <strong>{debt.total_debt} {currency}</strong> as
              settled?
            </p>
          ) : null
        })()}
      </Modal>
    </div>
  )
}
