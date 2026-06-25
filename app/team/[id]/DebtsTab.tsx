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
    return <div className="text-center py-8 text-indigo-300/80 animate-pulse">⏳ Loading debts...</div>
  }

  const debtors = debts.filter(d => d.total_debt > 0)
  const settled = debts.filter(d => d.total_debt === 0)

  return (
    <div>
      {error && (
        <div className="mb-6 p-4 backdrop-blur-md bg-red-500/20 border border-red-400/40 rounded-xl text-red-200 flex items-start gap-3">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {debts.length === 0 ? (
        <div className="text-center py-12 backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl">
          <p className="text-indigo-200">No team members found</p>
        </div>
      ) : (
        <>
          {debtors.length > 0 && (
            <div className="mb-10">
              <h3 className="text-xl font-bold mb-5 text-white flex items-center gap-2">
                💳 Outstanding Debts
              </h3>
              <div className="space-y-3">
                {debtors.map(debt => (
                  <div
                    key={debt.user.id}
                    className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl hover:bg-white/[0.15] hover:border-white/30 transition-all duration-300 flex items-center justify-between p-5 group"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <Avatar name={debt.user.name} avatar_url={debt.user.avatar_url} />
                      <div>
                        <p className="font-semibold text-white">{debt.user.name}</p>
                        <p className="text-sm text-indigo-200">{debt.user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">{debt.total_debt}</p>
                      <p className="text-sm text-indigo-300/80">{currency}</p>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setConfirmSettleId(debt.user.id)}
                        className="mt-3"
                      >
                        ✓ Settle
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {settled.length > 0 && (
            <div>
              <h3 className="text-xl font-bold mb-5 text-white flex items-center gap-2">
                ✓ All Settled
              </h3>
              <div className="space-y-3">
                {settled.map(debt => (
                  <div
                    key={debt.user.id}
                    className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl flex items-center justify-between p-5 opacity-70"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <Avatar name={debt.user.name} avatar_url={debt.user.avatar_url} />
                      <div>
                        <p className="font-semibold text-white">{debt.user.name}</p>
                        <p className="text-sm text-indigo-200">{debt.user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-indigo-200">✓ No debt</p>
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
